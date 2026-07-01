import Mentor from "../models/Mentor.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

// CREATE MENTOR
const createMentor = asyncHandler(async (req, res) => {
  const { serialNumber, name, description, mobileNumber, isActive } = req.body;

  if (!serialNumber || !name || !description || !mobileNumber) {
    throw new ApiError(
      400,
      "serialNumber, name, description and mobileNumber are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(
      400,
      "serialNumber must be a valid number greater than 0"
    );
  }

  const existingSerialNumber = await Mentor.findOne({
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
      "mentors"
    );

    photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  } else {
    throw new ApiError(400, "Mentor photo is required");
  }

  const mentor = await Mentor.create({
    serialNumber: parsedSerialNumber,
    name,
    description,
    mobileNumber,
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, mentor, "Mentor created successfully"));
});

// GET ALL MENTORS
const getMentors = asyncHandler(async (req, res) => {
  const {
    search,
    active,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const mentors = await Mentor.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await Mentor.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        mentors,
        total,
      },
      "Mentors fetched successfully"
    )
  );
});

// GET SINGLE MENTOR
const getMentorById = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }

  return res.status(200).json(new ApiResponse(200, mentor));
});

// UPDATE MENTOR
const updateMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }

  const { serialNumber, name, description, mobileNumber, isActive } = req.body;

  if (serialNumber !== undefined) {
    const parsedSerialNumber = Number(serialNumber);

    if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
      throw new ApiError(
        400,
        "serialNumber must be a valid number greater than 0"
      );
    }

    if (parsedSerialNumber !== mentor.serialNumber) {
      const existingSerialNumber = await Mentor.findOne({
        serialNumber: parsedSerialNumber,
        _id: { $ne: mentor._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      mentor.serialNumber = parsedSerialNumber;
    }
  }

  if (name !== undefined) mentor.name = name;
  if (description !== undefined) mentor.description = description;
  if (mobileNumber !== undefined) mentor.mobileNumber = mobileNumber;
  if (isActive !== undefined) mentor.isActive = toBoolean(isActive);

  if (req.file) {
    if (mentor.photo && mentor.photo.key) {
      await deleteFromS3(mentor.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "mentors"
    );

    mentor.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await mentor.save();

  return res
    .status(200)
    .json(new ApiResponse(200, mentor, "Mentor updated successfully"));
});

// DELETE MENTOR
const deleteMentor = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findById(req.params.id);

  if (!mentor) {
    throw new ApiError(404, "Mentor not found");
  }

  if (mentor.photo && mentor.photo.key) {
    await deleteFromS3(mentor.photo.key);
  }

  await mentor.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Mentor deleted successfully"));
});

export {
  createMentor,
  getMentors,
  getMentorById,
  updateMentor,
  deleteMentor,
};