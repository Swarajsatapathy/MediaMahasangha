import Member from "../models/Member.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

// CREATE MEMBER
const createMember = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    memberId,
    name,
    designation,
    district,
    mobileNumber,
    isActive,
  } = req.body;

  if (
    !serialNumber ||
    !memberId ||
    !name ||
    !designation ||
    !district ||
    !mobileNumber
  ) {
    throw new ApiError(
      400,
      "serialNumber, memberId, name, designation, district and mobileNumber are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(400, "serialNumber must be a valid number greater than 0");
  }

  const existingMember = await Member.findOne({ memberId });

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
    memberId,
    name,
    designation,
    district,
    mobileNumber,
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
    page = 1,
    limit = 20,
    district,
    designation,
    search,
    active,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (district) filter.district = district;
  if (designation) filter.designation = { $regex: designation, $options: "i" };
  if (active !== undefined) filter.isActive = active === "true";

  if (search) {
    filter.$or = [
      { memberId: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const sortOrder = order === "desc" ? -1 : 1;

  const [members, total] = await Promise.all([
    Member.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),

    Member.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      members,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  );
});

// GET SINGLE MEMBER
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  return res.status(200).json(new ApiResponse(200, member));
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
        _id: { $ne: member._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      member.serialNumber = parsedSerialNumber;
    }
  }

  if (memberId !== undefined && memberId !== member.memberId) {
    const existingMember = await Member.findOne({
      memberId,
      _id: { $ne: member._id },
    });

    if (existingMember) {
      throw new ApiError(409, "Member ID already exists");
    }

    member.memberId = memberId;
  }

  if (name !== undefined) member.name = name;
  if (designation !== undefined) member.designation = designation;
  if (district !== undefined) member.district = district;
  if (mobileNumber !== undefined) member.mobileNumber = mobileNumber;
  if (isActive !== undefined) member.isActive = toBoolean(isActive);

  if (req.file) {
    if (member.photo && member.photo.key) {
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

  if (member.photo && member.photo.key) {
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