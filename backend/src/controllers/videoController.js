import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toBoolean = (value) => value === "true" || value === true;

const parseTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    try {
      return JSON.parse(tags);
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const extractYouTubeId = (url) => {
  if (!url) return "";

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "";
};

// CREATE VIDEO
const createVideo = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    youtubeUrl,
    district,
    reporter,
    tags,
    isPublished,
    isFeatured,
    isFlash,
    isTrending,
    isEditorsPick,
  } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!youtubeUrl) {
    throw new ApiError(400, "YouTube URL is required");
  }

  const youtubeId = extractYouTubeId(youtubeUrl);

  if (!youtubeId) {
    throw new ApiError(400, "Invalid YouTube URL");
  }

  const published = toBoolean(isPublished);

  const video = await Video.create({
    title,
    description: description || "",
    youtubeUrl,
    youtubeId,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    district: district || "",
    reporter: reporter || "Admin",
    tags: parseTags(tags),
    isPublished: published,
    isFeatured: toBoolean(isFeatured),
    isFlash: toBoolean(isFlash),
    isTrending: toBoolean(isTrending),
    isEditorsPick: toBoolean(isEditorsPick),
    publishedAt: published ? new Date() : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video news created successfully"));
});

// GET ALL VIDEOS
const getVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    district,
    reporter,
    tag,
    featured,
    flash,
    trending,
    editorsPick,
    published,
    search,
    sortBy = "publishedAt",
    order = "desc",
  } = req.query;

  const filter = {};

  if (district) filter.district = district;
  if (reporter) filter.reporter = { $regex: reporter, $options: "i" };
  if (tag) filter.tags = tag;
  if (featured === "true") filter.isFeatured = true;
  if (flash === "true") filter.isFlash = true;
  if (trending === "true") filter.isTrending = true;
  if (editorsPick === "true") filter.isEditorsPick = true;
  if (published !== undefined) filter.isPublished = published === "true";

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const sortOrder = order === "asc" ? 1 : -1;

  const [videos, total] = await Promise.all([
    Video.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),

    Video.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  );
});

// GET SINGLE VIDEO
const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.views += 1;
  await video.save();

  return res.status(200).json(new ApiResponse(200, video));
});

// UPDATE VIDEO
const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const {
    title,
    description,
    youtubeUrl,
    district,
    reporter,
    tags,
    isPublished,
    isFeatured,
    isFlash,
    isTrending,
    isEditorsPick,
  } = req.body;

  if (title !== undefined) video.title = title;
  if (description !== undefined) video.description = description;
  if (district !== undefined) video.district = district;
  if (reporter !== undefined) video.reporter = reporter;
  if (tags !== undefined) video.tags = parseTags(tags);

  if (youtubeUrl !== undefined) {
    const youtubeId = extractYouTubeId(youtubeUrl);

    if (!youtubeId) {
      throw new ApiError(400, "Invalid YouTube URL");
    }

    video.youtubeUrl = youtubeUrl;
    video.youtubeId = youtubeId;
    video.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  if (isPublished !== undefined) {
    video.isPublished = toBoolean(isPublished);

    if (video.isPublished && !video.publishedAt) {
      video.publishedAt = new Date();
    }
  }

  if (isFeatured !== undefined) video.isFeatured = toBoolean(isFeatured);
  if (isFlash !== undefined) video.isFlash = toBoolean(isFlash);
  if (isTrending !== undefined) video.isTrending = toBoolean(isTrending);
  if (isEditorsPick !== undefined) video.isEditorsPick = toBoolean(isEditorsPick);

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video news updated successfully"));
});

// DELETE VIDEO
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video news deleted successfully"));
});

// GET FEATURED VIDEOS
const getFeaturedVideos = asyncHandler(async (_req, res) => {
  const videos = await Video.find({
    isFeatured: true,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(5)
    .lean();

  return res.status(200).json(new ApiResponse(200, videos));
});

// GET FLASH VIDEOS
const getFlashVideos = asyncHandler(async (_req, res) => {
  const videos = await Video.find({
    isFlash: true,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  return res.status(200).json(new ApiResponse(200, videos));
});

export {
  createVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getFeaturedVideos,
  getFlashVideos,
};