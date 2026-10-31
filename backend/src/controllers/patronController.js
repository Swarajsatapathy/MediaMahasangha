import Patron from "../models/Patron.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

// CREATE PATRON
const createPatron = asyncHandler(async (req, res) => {
  const { serialNumber, name, designation, designation2, area, district, isActive } = req.body;

  if (!serialNumber || !name || !designation) {
    throw new ApiError(
      400,
      "serialNumber, name, and designation are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(
      400,
      "serialNumber must be a valid number greater than 0"
    );
  }

  const existingSerialNumber = await Patron.findOne({
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
      "patrons"
    );

    photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  const areaValue = (area || district || "").trim();
  const districtValue = (district || area || "").trim();

  const patron = await Patron.create({
    serialNumber: parsedSerialNumber,
    name: name.trim(),
    designation: designation.trim(),
    designation2: designation2 ? designation2.trim() : "",
    area: areaValue,
    district: districtValue,
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, patron, "Chief Patron created successfully"));
});

// GET ALL PATRONS
const getPatrons = asyncHandler(async (req, res) => {
  const {
    area,
    district,
    designation,
    search,
    active,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (area) {
    filter.$or = [
      { area: { $regex: area, $options: "i" } },
      { district: { $regex: area, $options: "i" } },
    ];
  } else if (district) {
    filter.$or = [
      { district: { $regex: district, $options: "i" } },
      { area: { $regex: district, $options: "i" } },
    ];
  }

  if (designation) {
    filter.$or = [
      { designation: { $regex: designation, $options: "i" } },
      { designation2: { $regex: designation, $options: "i" } },
    ];
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
      { designation2: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const patrons = await Patron.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await Patron.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patrons,
        total,
      },
      "Chief Patrons fetched successfully"
    )
  );
});

// GET SINGLE PATRON
const getPatronById = asyncHandler(async (req, res) => {
  const patron = await Patron.findById(req.params.id);

  if (!patron) {
    throw new ApiError(404, "Chief Patron not found");
  }

  return res.status(200).json(new ApiResponse(200, patron));
});

// UPDATE PATRON
const updatePatron = asyncHandler(async (req, res) => {
  const patron = await Patron.findById(req.params.id);

  if (!patron) {
    throw new ApiError(404, "Chief Patron not found");
  }

  const { serialNumber, name, designation, designation2, area, district, isActive } = req.body;

  if (serialNumber !== undefined) {
    const parsedSerialNumber = Number(serialNumber);

    if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
      throw new ApiError(
        400,
        "serialNumber must be a valid number greater than 0"
      );
    }

    if (parsedSerialNumber !== patron.serialNumber) {
      const existingSerialNumber = await Patron.findOne({
        serialNumber: parsedSerialNumber,
        _id: { $ne: patron._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      patron.serialNumber = parsedSerialNumber;
    }
  }

  if (name !== undefined) patron.name = name.trim();
  if (designation !== undefined) patron.designation = designation.trim();
  if (designation2 !== undefined) patron.designation2 = designation2.trim();
  if (area !== undefined || district !== undefined) {
    const areaValue = (area || district || "").trim();
    patron.area = areaValue;
    patron.district = areaValue;
  }
  if (isActive !== undefined) patron.isActive = toBoolean(isActive);

  if (req.file) {
    if (patron.photo && patron.photo.key) {
      await deleteFromS3(patron.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "patrons"
    );

    patron.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await patron.save();

  return res
    .status(200)
    .json(new ApiResponse(200, patron, "Chief Patron updated successfully"));
});

// DELETE PATRON
const deletePatron = asyncHandler(async (req, res) => {
  const patron = await Patron.findById(req.params.id);

  if (!patron) {
    throw new ApiError(404, "Chief Patron not found");
  }

  if (patron.photo && patron.photo.key) {
    await deleteFromS3(patron.photo.key);
  }

  await patron.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Chief Patron deleted successfully"));
});

export {
  createPatron,
  getPatrons,
  getPatronById,
  updatePatron,
  deletePatron,
};

