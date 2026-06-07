import Article from "../models/Article.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

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

// CREATE ARTICLE
const createArticle = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    reporter,
    tags,
    district,
    isPublished,
    isFeatured,
    isFlash,
    isTrending,
    isEditorsPick,
  } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const images = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { url, key } = await uploadToS3(
        file.buffer,
        file.mimetype,
        "articles"
      );

      images.push({
        url,
        key,
        caption: "",
      });
    }
  }

  const published = toBoolean(isPublished);

  const article = await Article.create({
    title,
    content: content || "",
    images,
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
    .json(new ApiResponse(201, article, "Article created successfully"));
});

// GET ALL ARTICLES
const getArticles = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    reporter,
    tag,
    featured,
    trending,
    editorsPick,
    flash,
    published,
    search,
    sortBy = "publishedAt",
    order = "desc",
  } = req.query;

  const filter = {};

  if (req.query.district) filter.district = req.query.district;
  if (reporter) filter.reporter = { $regex: reporter, $options: "i" };
  if (tag) filter.tags = tag;
  if (featured === "true") filter.isFeatured = true;
  if (trending === "true") filter.isTrending = true;
  if (editorsPick === "true") filter.isEditorsPick = true;
  if (flash === "true") filter.isFlash = true;
  if (published !== undefined) filter.isPublished = published === "true";

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const sortOrder = order === "asc" ? 1 : -1;

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),

    Article.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      articles,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  );
});

// GET SINGLE ARTICLE
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  article.views += 1;
  await article.save();

  return res.status(200).json(new ApiResponse(200, article));
});

// UPDATE ARTICLE
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  const {
    title,
    content,
    reporter,
    tags,
    district,
    isPublished,
    isFeatured,
    isFlash,
    isTrending,
    isEditorsPick,
    removeImages,
  } = req.body;

  if (removeImages) {
    const keysToRemove =
      typeof removeImages === "string" ? JSON.parse(removeImages) : removeImages;

    for (const key of keysToRemove) {
      await deleteFromS3(key);
      article.images = article.images.filter((img) => img.key !== key);
    }
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { url, key } = await uploadToS3(
        file.buffer,
        file.mimetype,
        "articles"
      );

      article.images.push({
        url,
        key,
        caption: "",
      });
    }
  }

  if (title !== undefined) article.title = title;
  if (content !== undefined) article.content = content;
  if (district !== undefined) article.district = district;
  if (reporter !== undefined) article.reporter = reporter;
  if (tags !== undefined) article.tags = parseTags(tags);

  if (isPublished !== undefined) {
    article.isPublished = toBoolean(isPublished);

    if (article.isPublished && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }

  if (isFeatured !== undefined) article.isFeatured = toBoolean(isFeatured);
  if (isFlash !== undefined) article.isFlash = toBoolean(isFlash);
  if (isTrending !== undefined) article.isTrending = toBoolean(isTrending);
  if (isEditorsPick !== undefined) article.isEditorsPick = toBoolean(isEditorsPick);

  await article.save();

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Article updated successfully"));
});

// DELETE ARTICLE
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  for (const img of article.images) {
    await deleteFromS3(img.key);
  }

  await article.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Article deleted successfully"));
});

// FLASH STORIES
const getFlashStories = asyncHandler(async (_req, res) => {
  const articles = await Article.find({
    isFlash: true,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  return res.status(200).json(new ApiResponse(200, articles));
});

// EDITORS PICKS
const getEditorsPicks = asyncHandler(async (_req, res) => {
  const articles = await Article.find({
    isEditorsPick: true,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();

  return res.status(200).json(new ApiResponse(200, articles));
});

// TRENDING STORIES
const getTrendingStories = asyncHandler(async (_req, res) => {
  const articles = await Article.find({
    isTrending: true,
    isPublished: true,
  })
    .sort({ views: -1 })
    .limit(10)
    .lean();

  return res.status(200).json(new ApiResponse(200, articles));
});

// FEATURED STORIES
const getFeaturedStories = asyncHandler(async (_req, res) => {
  const articles = await Article.find({
    isFeatured: true,
    isPublished: true,
  })
    .sort({ publishedAt: -1 })
    .limit(5)
    .lean();

  return res.status(200).json(new ApiResponse(200, articles));
});

export {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getFlashStories,
  getEditorsPicks,
  getTrendingStories,
  getFeaturedStories,
};