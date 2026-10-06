import SupremeCouncil from "../models/SupremeCouncil.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

// CREATE SUPREME COUNCIL MEMBER
const createSupremeCouncilMember = asyncHandler(async (req, res) => {
  const { serialNumber, name, designation, district, isActive } = req.body;

  if (!serialNumber || !name || !designation || !district) {
    throw new ApiError(
      400,
      "serialNumber, name, designation and district are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(
      400,
      "serialNumber must be a valid number greater than 0"
    );
  }

  const existingSerialNumber = await SupremeCouncil.findOne({
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
      "supreme-council"
    );

    photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  const member = await SupremeCouncil.create({
    serialNumber: parsedSerialNumber,
    name,
    designation,
    district,
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, member, "Supreme Council member created successfully"));
});

// GET ALL SUPREME COUNCIL MEMBERS
const getSupremeCouncilMembers = asyncHandler(async (req, res) => {
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
      { district: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const members = await SupremeCouncil.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await SupremeCouncil.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        members,
        total,
      },
      "Supreme Council members fetched successfully"
    )
  );
});

// GET SINGLE SUPREME COUNCIL MEMBER
const getSupremeCouncilMemberById = asyncHandler(async (req, res) => {
  const member = await SupremeCouncil.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Supreme Council member not found");
  }

  return res.status(200).json(new ApiResponse(200, member));
});

// UPDATE SUPREME COUNCIL MEMBER
const updateSupremeCouncilMember = asyncHandler(async (req, res) => {
  const member = await SupremeCouncil.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Supreme Council member not found");
  }

  const { serialNumber, name, designation, district, isActive } = req.body;

  if (serialNumber !== undefined) {
    const parsedSerialNumber = Number(serialNumber);

    if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
      throw new ApiError(
        400,
        "serialNumber must be a valid number greater than 0"
      );
    }

    if (parsedSerialNumber !== member.serialNumber) {
      const existingSerialNumber = await SupremeCouncil.findOne({
        serialNumber: parsedSerialNumber,
        _id: { $ne: member._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      member.serialNumber = parsedSerialNumber;
    }
  }

  if (name !== undefined) member.name = name;
  if (designation !== undefined) member.designation = designation;
  if (district !== undefined) member.district = district;
  if (isActive !== undefined) member.isActive = toBoolean(isActive);

  if (req.file) {
    if (member.photo && member.photo.key) {
      await deleteFromS3(member.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "supreme-council"
    );

    member.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await member.save();

  return res
    .status(200)
    .json(new ApiResponse(200, member, "Supreme Council member updated successfully"));
});

// DELETE SUPREME COUNCIL MEMBER
const deleteSupremeCouncilMember = asyncHandler(async (req, res) => {
  const member = await SupremeCouncil.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Supreme Council member not found");
  }

  if (member.photo && member.photo.key) {
    await deleteFromS3(member.photo.key);
  }

  await member.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Supreme Council member deleted successfully"));
});

export {
  createSupremeCouncilMember,
  getSupremeCouncilMembers,
  getSupremeCouncilMemberById,
  updateSupremeCouncilMember,
  deleteSupremeCouncilMember,
};
