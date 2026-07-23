import Member from "../models/Member.js";
import DISTRICTS from "../constants/districts.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadToS3,
  deleteFromS3,
} from "../utils/s3Upload.js";

const toBoolean = (value) =>
  value === "true" || value === true;

/*
  Validates and normalizes committee information.

  State member:
  {
    committeeType: "state",
    committeeDistrict: ""
  }

  District member:
  {
    committeeType: "district",
    committeeDistrict: "Angul"
  }
*/
const normalizeCommitteeData = (
  committeeType,
  committeeDistrict,
  required = true
) => {
  const normalizedType =
    typeof committeeType === "string"
      ? committeeType.trim().toLowerCase()
      : "";

  if (!normalizedType) {
    if (required) {
      throw new ApiError(
        400,
        "Committee type is required"
      );
    }

    return {
      committeeType: null,
      committeeDistrict: "",
    };
  }

  if (
    normalizedType !== "state" &&
    normalizedType !== "district"
  ) {
    throw new ApiError(
      400,
      "Committee type must be either state or district"
    );
  }

  /*
    State Committee members do not require a district
    committee value.
  */
  if (normalizedType === "state") {
    return {
      committeeType: "state",
      committeeDistrict: "",
    };
  }

  const normalizedCommitteeDistrict =
    typeof committeeDistrict === "string"
      ? committeeDistrict.trim()
      : "";

  if (!normalizedCommitteeDistrict) {
    throw new ApiError(
      400,
      "Committee district is required for a district committee member"
    );
  }

  if (
    !DISTRICTS.includes(normalizedCommitteeDistrict)
  ) {
    throw new ApiError(
      400,
      "Invalid committee district selected"
    );
  }

  return {
    committeeType: "district",
    committeeDistrict:
      normalizedCommitteeDistrict,
  };
};

/*
  Converts an HTML date input such as:
  2027-07-20

  into a JavaScript Date.

  The selected date remains valid throughout that day.
*/
const parseValidUptoDate = (value) => {
  if (!value) {
    throw new ApiError(
      400,
      "Valid upto date is required"
    );
  }

  /*
    Accept only YYYY-MM-DD to avoid unintended date values.
  */
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    throw new ApiError(
      400,
      "Valid upto must be in YYYY-MM-DD format"
    );
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  /*
    Store the date at noon UTC.

    This avoids the selected date moving one day forward
    or backward because of timezone conversion.
  */
  const parsedDate = new Date(
    Date.UTC(year, month - 1, day, 12, 0, 0, 0)
  );

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new ApiError(
      400,
      "Valid upto must be a valid date"
    );
  }

  return parsedDate;
};

// CREATE MEMBER
const createMember = asyncHandler(
  async (req, res) => {
    const {
      serialNumber,
      memberId,
      name,
      designation,
      district,
      committeeType,
      committeeDistrict,
      mobileNumber,
      validUpto,
      isActive,
    } = req.body;

    if (
      !serialNumber ||
      !memberId ||
      !name ||
      !designation ||
      !district ||
      !committeeType ||
      !mobileNumber ||
      !validUpto
    ) {
      throw new ApiError(
        400,
        "serialNumber, memberId, name, designation, district, committeeType, mobileNumber and validUpto are required"
      );
    }

    if (!DISTRICTS.includes(district)) {
      throw new ApiError(
        400,
        "Invalid member district selected"
      );
    }

    const parsedSerialNumber =
      Number(serialNumber);

    if (
      Number.isNaN(parsedSerialNumber) ||
      parsedSerialNumber < 1
    ) {
      throw new ApiError(
        400,
        "serialNumber must be a valid number greater than 0"
      );
    }

    const parsedValidUpto =
      parseValidUptoDate(validUpto);

    const normalizedCommittee =
      normalizeCommitteeData(
        committeeType,
        committeeDistrict
      );

    const existingMember = await Member.findOne({
      memberId: memberId.trim(),
    });

    if (existingMember) {
      throw new ApiError(
        409,
        "Member ID already exists"
      );
    }

    const existingSerialNumber =
      await Member.findOne({
        serialNumber: parsedSerialNumber,
      });

    if (existingSerialNumber) {
      throw new ApiError(
        409,
        "Serial number already exists"
      );
    }

    let photo = {
      url: "",
      key: "",
    };

    if (req.file) {
      const uploaded = await uploadToS3(
        req.file.buffer,
        req.file.mimetype,
        "members"
      );

      photo = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    const member = await Member.create({
      serialNumber: parsedSerialNumber,
      memberId: memberId.trim(),
      name: name.trim(),
      designation: designation.trim(),
      district,
      committeeType:
        normalizedCommittee.committeeType,
      committeeDistrict:
        normalizedCommittee.committeeDistrict,
      mobileNumber: mobileNumber.trim(),
      validUpto: parsedValidUpto,
      photo,
      isActive:
        isActive === undefined
          ? true
          : toBoolean(isActive),
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        member,
        "Member created successfully"
      )
    );
  }
);

// GET ALL MEMBERS
const getMembers = asyncHandler(
  async (req, res) => {
    const {
      district,
      designation,
      committeeType,
      committeeDistrict,
      search,
      active,
      validity,
      sortBy = "serialNumber",
      order = "asc",
    } = req.query;

    const filter = {};

    /*
      This filters by the member's normal/home district.
    */
    if (district) {
      if (!DISTRICTS.includes(district)) {
        throw new ApiError(
          400,
          "Invalid member district"
        );
      }

      filter.district = district;
    }

    if (designation) {
      filter.designation = {
        $regex: designation,
        $options: "i",
      };
    }

    /*
      Committee filters:

      State Committee:
      ?committeeType=state

      District Committee:
      ?committeeType=district&committeeDistrict=Angul
    */
    if (committeeType) {
      const normalizedCommitteeType =
        committeeType.toLowerCase();

      if (
        normalizedCommitteeType !== "state" &&
        normalizedCommitteeType !== "district"
      ) {
        throw new ApiError(
          400,
          "committeeType must be either state or district"
        );
      }

      filter.committeeType =
        normalizedCommitteeType;

      if (
        normalizedCommitteeType === "state" &&
        committeeDistrict
      ) {
        throw new ApiError(
          400,
          "committeeDistrict cannot be used with State Committee"
        );
      }
    }

    if (committeeDistrict) {
      if (!DISTRICTS.includes(committeeDistrict)) {
        throw new ApiError(
          400,
          "Invalid committee district"
        );
      }

      /*
        Supplying committeeDistrict automatically limits
        results to district committee members.
      */
      filter.committeeType = "district";
      filter.committeeDistrict =
        committeeDistrict;
    }

    if (active !== undefined) {
      if (
        active !== "true" &&
        active !== "false"
      ) {
        throw new ApiError(
          400,
          "active must be true or false"
        );
      }

      filter.isActive = active === "true";
    }

    /*
      Supported query parameters:

      ?validity=valid
      ?validity=expired
    */
    if (validity) {
      const normalizedValidity =
        validity.toLowerCase();

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (normalizedValidity === "valid") {
        filter.isActive = true;
        filter.validUpto = {
          $gte: now,
        };
      } else if (
        normalizedValidity === "expired"
      ) {
        filter.validUpto = {
          $lt: now,
        };
      } else {
        throw new ApiError(
          400,
          "validity must be either valid or expired"
        );
      }
    }

    if (search) {
      filter.$or = [
        {
          memberId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          district: {
            $regex: search,
            $options: "i",
          },
        },
        {
          committeeDistrict: {
            $regex: search,
            $options: "i",
          },
        },
        {
          designation: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const allowedSortFields = [
      "serialNumber",
      "memberId",
      "name",
      "designation",
      "district",
      "committeeType",
      "committeeDistrict",
      "validUpto",
      "createdAt",
      "updatedAt",
    ];

    const selectedSortField =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : "serialNumber";

    const sortOrder =
      order === "desc" ? -1 : 1;

    /*
      Do not use .lean() because membershipStatus and
      isMembershipValid are Mongoose virtual fields.
    */
    const members = await Member.find(
      filter
    ).sort({
      [selectedSortField]: sortOrder,
    });

    const total =
      await Member.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          members,
          total,
        },
        "Members fetched successfully"
      )
    );
  }
);

// GET SINGLE MEMBER
const getMemberById = asyncHandler(
  async (req, res) => {
    const member = await Member.findById(
      req.params.id
    );

    if (!member) {
      throw new ApiError(
        404,
        "Member not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        member,
        "Member fetched successfully"
      )
    );
  }
);

// UPDATE MEMBER
const updateMember = asyncHandler(
  async (req, res) => {
    const member = await Member.findById(
      req.params.id
    );

    if (!member) {
      throw new ApiError(
        404,
        "Member not found"
      );
    }

    const {
      serialNumber,
      memberId,
      name,
      designation,
      district,
      committeeType,
      committeeDistrict,
      mobileNumber,
      validUpto,
      isActive,
    } = req.body;

    if (serialNumber !== undefined) {
      const parsedSerialNumber =
        Number(serialNumber);

      if (
        Number.isNaN(parsedSerialNumber) ||
        parsedSerialNumber < 1
      ) {
        throw new ApiError(
          400,
          "serialNumber must be a valid number greater than 0"
        );
      }

      if (
        parsedSerialNumber !==
        member.serialNumber
      ) {
        const existingSerialNumber =
          await Member.findOne({
            serialNumber:
              parsedSerialNumber,
            _id: {
              $ne: member._id,
            },
          });

        if (existingSerialNumber) {
          throw new ApiError(
            409,
            "Serial number already exists"
          );
        }

        member.serialNumber =
          parsedSerialNumber;
      }
    }

    if (memberId !== undefined) {
      const trimmedMemberId =
        memberId.trim();

      if (!trimmedMemberId) {
        throw new ApiError(
          400,
          "Member ID cannot be empty"
        );
      }

      if (
        trimmedMemberId !==
        member.memberId
      ) {
        const existingMember =
          await Member.findOne({
            memberId: trimmedMemberId,
            _id: {
              $ne: member._id,
            },
          });

        if (existingMember) {
          throw new ApiError(
            409,
            "Member ID already exists"
          );
        }

        member.memberId =
          trimmedMemberId;
      }
    }

    if (name !== undefined) {
      if (!name.trim()) {
        throw new ApiError(
          400,
          "Name cannot be empty"
        );
      }

      member.name = name.trim();
    }

    if (designation !== undefined) {
      if (!designation.trim()) {
        throw new ApiError(
          400,
          "Designation cannot be empty"
        );
      }

      member.designation =
        designation.trim();
    }

    if (district !== undefined) {
      if (!DISTRICTS.includes(district)) {
        throw new ApiError(
          400,
          "Invalid member district selected"
        );
      }

      member.district = district;
    }

    /*
      Update committee details whenever either committee
      field is included in the request.

      This also supports changing:
      State → District
      District → State
      District A → District B
    */
    if (
      committeeType !== undefined ||
      committeeDistrict !== undefined
    ) {
      const nextCommitteeType =
        committeeType !== undefined
          ? committeeType
          : member.committeeType;

      const nextCommitteeDistrict =
        committeeDistrict !== undefined
          ? committeeDistrict
          : member.committeeDistrict;

      const normalizedCommittee =
        normalizeCommitteeData(
          nextCommitteeType,
          nextCommitteeDistrict
        );

      member.committeeType =
        normalizedCommittee.committeeType;

      member.committeeDistrict =
        normalizedCommittee.committeeDistrict;
    }

    if (mobileNumber !== undefined) {
      if (!mobileNumber.trim()) {
        throw new ApiError(
          400,
          "Mobile number cannot be empty"
        );
      }

      member.mobileNumber =
        mobileNumber.trim();
    }

    if (validUpto !== undefined) {
      member.validUpto =
        parseValidUptoDate(validUpto);
    }

    if (isActive !== undefined) {
      member.isActive =
        toBoolean(isActive);
    }

    if (req.file) {
      if (member.photo?.key) {
        await deleteFromS3(
          member.photo.key
        );
      }

      const uploaded = await uploadToS3(
        req.file.buffer,
        req.file.mimetype,
        "members"
      );

      member.photo = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    await member.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        member,
        "Member updated successfully"
      )
    );
  }
);

// DELETE MEMBER
const deleteMember = asyncHandler(
  async (req, res) => {
    const member = await Member.findById(
      req.params.id
    );

    if (!member) {
      throw new ApiError(
        404,
        "Member not found"
      );
    }

    if (member.photo?.key) {
      await deleteFromS3(
        member.photo.key
      );
    }

    await member.deleteOne();

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Member deleted successfully"
      )
    );
  }
);

export {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};