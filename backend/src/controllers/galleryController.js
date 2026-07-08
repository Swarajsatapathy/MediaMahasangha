import Gallery from "../models/Gallery.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

// CREATE GALLERY ITEM
const createGalleryItem = asyncHandler(async (req, res) => {
  const { description, district, area } = req.body;

  if (!description || !district || !area) {
    throw new ApiError(400, "description, district and area are required");
  }

  if (!req.file) {
    throw new ApiError(400, "Photo is required");
  }

  const uploaded = await uploadToS3(
    req.file.buffer,
    req.file.mimetype,
    "gallery"
  );

  const galleryItem = await Gallery.create({
    description,
    district,
    area,
    photo: {
      url: uploaded.url,
      key: uploaded.key,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, galleryItem, "Gallery item created successfully"));
});

// GET ALL GALLERY ITEMS
const getGalleryItems = asyncHandler(async (req, res) => {
  const {
    district,
    area,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const filter = {};

  if (district) {
    filter.district = district;
  }

  if (area) {
    filter.area = { $regex: area, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "asc" ? 1 : -1;

  const galleryItems = await Gallery.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await Gallery.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        galleryItems,
        total,
      },
      "Gallery items fetched successfully"
    )
  );
});

// GET SINGLE GALLERY ITEM
const getGalleryItemById = asyncHandler(async (req, res) => {
  const galleryItem = await Gallery.findById(req.params.id);

  if (!galleryItem) {
    throw new ApiError(404, "Gallery item not found");
  }

  return res.status(200).json(new ApiResponse(200, galleryItem));
});

// UPDATE GALLERY ITEM
const updateGalleryItem = asyncHandler(async (req, res) => {
  const galleryItem = await Gallery.findById(req.params.id);

  if (!galleryItem) {
    throw new ApiError(404, "Gallery item not found");
  }

  const { description, district, area } = req.body;

  if (description !== undefined) galleryItem.description = description;
  if (district !== undefined) galleryItem.district = district;
  if (area !== undefined) galleryItem.area = area;

  if (req.file) {
    if (galleryItem.photo && galleryItem.photo.key) {
      await deleteFromS3(galleryItem.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "gallery"
    );

    galleryItem.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await galleryItem.save();

  return res
    .status(200)
    .json(new ApiResponse(200, galleryItem, "Gallery item updated successfully"));
});

// DELETE GALLERY ITEM
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const galleryItem = await Gallery.findById(req.params.id);

  if (!galleryItem) {
    throw new ApiError(404, "Gallery item not found");
  }

  if (galleryItem.photo && galleryItem.photo.key) {
    await deleteFromS3(galleryItem.photo.key);
  }

  await galleryItem.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Gallery item deleted successfully"));
});

export {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
};