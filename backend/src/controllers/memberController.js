import Member from "../models/Member.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

/*
  Converts an HTML date input such as:
  2027-07-20

  into a valid JavaScript Date.

  The time is set to the end of the selected day so that
  the membership remains valid throughout that date.
*/
const parseValidUptoDate = (value) => {
  if (!value) {
    throw new ApiError(400, "Valid upto date is required");
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new ApiError(
      400,
      "Valid upto must be a valid date in YYYY-MM-DD format"
    );
  }

  parsedDate.setHours(23, 59, 59, 999);

  return parsedDate;
};

// CREATE MEMBER
const createMember = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    memberId,
    name,
    designation,
    district,
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
    !mobileNumber ||
    !validUpto
  ) {
    throw new ApiError(
      400,
      "serialNumber, memberId, name, designation, district, mobileNumber and validUpto are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(
      400,
      "serialNumber must be a valid number greater than 0"
    );
  }

  const parsedValidUpto = parseValidUptoDate(validUpto);

  const existingMember = await Member.findOne({
    memberId: memberId.trim(),
  });

  if (existingMember) {
    throw new ApiError(409, "Member ID already exists");
  }

  const existingSerialNumber = await Member.findOne({
    serialNumber: parsedSerialNumber,
  });

  if (existingSerialNumber) {
    throw new ApiError(409, "Serial number already exists");
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
    mobileNumber: mobileNumber.trim(),
    validUpto: parsedValidUpto,
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, member, "Member created successfully"));
});

// GET ALL MEMBERS
const getMembers = asyncHandler(async (req, res) => {
  const {
    district,
    designation,
    search,
    active,
    validity,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (district) {
    filter.district = district;
  }

  if (designation) {
    filter.designation = {
      $regex: designation,
      $options: "i",
    };
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  /*
    Supported query parameters:

    ?validity=valid
    ?validity=expired
  */
  if (validity) {
    const normalizedValidity = validity.toLowerCase();

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (normalizedValidity === "valid") {
      filter.isActive = true;
      filter.validUpto = {
        $gte: now,
      };
    } else if (normalizedValidity === "expired") {
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
    "validUpto",
    "createdAt",
    "updatedAt",
  ];

  const selectedSortField = allowedSortFields.includes(sortBy)
    ? sortBy
    : "serialNumber";

  const sortOrder = order === "desc" ? -1 : 1;

  /*
    Do not use .lean() here because membershipStatus and
    isMembershipValid are Mongoose virtual fields.
  */
  const members = await Member.find(filter).sort({
    [selectedSortField]: sortOrder,
  });

  const total = await Member.countDocuments(filter);

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
});

// GET SINGLE MEMBER
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, member, "Member fetched successfully"));
});

// UPDATE MEMBER
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const {
    serialNumber,
    memberId,
    name,
    designation,
    district,
    mobileNumber,
    validUpto,
    isActive,
  } = req.body;

  if (serialNumber !== undefined) {
    const parsedSerialNumber = Number(serialNumber);

    if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
      throw new ApiError(
        400,
        "serialNumber must be a valid number greater than 0"
      );
    }

    if (parsedSerialNumber !== member.serialNumber) {
      const existingSerialNumber = await Member.findOne({
        serialNumber: parsedSerialNumber,
        _id: {
          $ne: member._id,
        },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      member.serialNumber = parsedSerialNumber;
    }
  }

  if (memberId !== undefined) {
    const trimmedMemberId = memberId.trim();

    if (!trimmedMemberId) {
      throw new ApiError(400, "Member ID cannot be empty");
    }

    if (trimmedMemberId !== member.memberId) {
      const existingMember = await Member.findOne({
        memberId: trimmedMemberId,
        _id: {
          $ne: member._id,
        },
      });

      if (existingMember) {
        throw new ApiError(409, "Member ID already exists");
      }

      member.memberId = trimmedMemberId;
    }
  }

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Name cannot be empty");
    }

    member.name = name.trim();
  }

  if (designation !== undefined) {
    if (!designation.trim()) {
      throw new ApiError(400, "Designation cannot be empty");
    }

    member.designation = designation.trim();
  }

  if (district !== undefined) {
    member.district = district;
  }

  if (mobileNumber !== undefined) {
    if (!mobileNumber.trim()) {
      throw new ApiError(400, "Mobile number cannot be empty");
    }

    member.mobileNumber = mobileNumber.trim();
  }

  if (validUpto !== undefined) {
    member.validUpto = parseValidUptoDate(validUpto);
  }

  if (isActive !== undefined) {
    member.isActive = toBoolean(isActive);
  }

  if (req.file) {
    if (member.photo?.key) {
      await deleteFromS3(member.photo.key);
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

  return res
    .status(200)
    .json(new ApiResponse(200, member, "Member updated successfully"));
});

// DELETE MEMBER
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.photo?.key) {
    await deleteFromS3(member.photo.key);
  }

  await member.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Member deleted successfully"));
});

export {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
};