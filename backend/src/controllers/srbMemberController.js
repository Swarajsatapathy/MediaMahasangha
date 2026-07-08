import SrbMember from "../models/SrbMember.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// CREATE SRB MEMBER
const createSrbMember = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    name,
    designation,
    district,
    mobileNumber,
    email,
    isActive,
  } = req.body;

  if (
    !serialNumber ||
    !name ||
    !designation ||
    !district ||
    !mobileNumber ||
    !email
  ) {
    throw new ApiError(
      400,
      "serialNumber, name, designation, district, mobileNumber and email are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(400, "serialNumber must be a valid number greater than 0");
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  const existingSerialNumber = await SrbMember.findOne({
    serialNumber: parsedSerialNumber,
  });

  if (existingSerialNumber) {
    throw new ApiError(409, "Serial number already exists");
  }

  const existingEmail = await SrbMember.findOne({
    email: email.toLowerCase(),
  });

  if (existingEmail) {
    throw new ApiError(409, "Email ID already exists");
  }

  let photo = {
    url: "",
    key: "",
  };

  if (req.file) {
    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "srb-members"
    );

    photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  const srbMember = await SrbMember.create({
    serialNumber: parsedSerialNumber,
    name,
    designation,
    district,
    mobileNumber,
    email: email.toLowerCase(),
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, srbMember, "SRB member created successfully"));
});

// GET ALL SRB MEMBERS
const getSrbMembers = asyncHandler(async (req, res) => {
  const {
    district,
    designation,
    search,
    active,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (district) {
    filter.district = district;
  }

  if (designation) {
    filter.designation = { $regex: designation, $options: "i" };
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const srbMembers = await SrbMember.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await SrbMember.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        srbMembers,
        total,
      },
      "SRB members fetched successfully"
    )
  );
});

// GET SINGLE SRB MEMBER
const getSrbMemberById = asyncHandler(async (req, res) => {
  const srbMember = await SrbMember.findById(req.params.id);

  if (!srbMember) {
    throw new ApiError(404, "SRB member not found");
  }

  return res.status(200).json(new ApiResponse(200, srbMember));
});

// UPDATE SRB MEMBER
const updateSrbMember = asyncHandler(async (req, res) => {
  const srbMember = await SrbMember.findById(req.params.id);

  if (!srbMember) {
    throw new ApiError(404, "SRB member not found");
  }

  const {
    serialNumber,
    name,
    designation,
    district,
    mobileNumber,
    email,
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

    if (parsedSerialNumber !== srbMember.serialNumber) {
      const existingSerialNumber = await SrbMember.findOne({
        serialNumber: parsedSerialNumber,
        _id: { $ne: srbMember._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      srbMember.serialNumber = parsedSerialNumber;
    }
  }

  if (email !== undefined && email.toLowerCase() !== srbMember.email) {
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Please provide a valid email address");
    }

    const existingEmail = await SrbMember.findOne({
      email: email.toLowerCase(),
      _id: { $ne: srbMember._id },
    });

    if (existingEmail) {
      throw new ApiError(409, "Email ID already exists");
    }

    srbMember.email = email.toLowerCase();
  }

  if (name !== undefined) srbMember.name = name;
  if (designation !== undefined) srbMember.designation = designation;
  if (district !== undefined) srbMember.district = district;
  if (mobileNumber !== undefined) srbMember.mobileNumber = mobileNumber;
  if (isActive !== undefined) srbMember.isActive = toBoolean(isActive);

  if (req.file) {
    if (srbMember.photo && srbMember.photo.key) {
      await deleteFromS3(srbMember.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "srb-members"
    );

    srbMember.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await srbMember.save();

  return res
    .status(200)
    .json(new ApiResponse(200, srbMember, "SRB member updated successfully"));
});

// DELETE SRB MEMBER
const deleteSrbMember = asyncHandler(async (req, res) => {
  const srbMember = await SrbMember.findById(req.params.id);

  if (!srbMember) {
    throw new ApiError(404, "SRB member not found");
  }

  if (srbMember.photo && srbMember.photo.key) {
    await deleteFromS3(srbMember.photo.key);
  }

  await srbMember.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "SRB member deleted successfully"));
});

export {
  createSrbMember,
  getSrbMembers,
  getSrbMemberById,
  updateSrbMember,
  deleteSrbMember,
};