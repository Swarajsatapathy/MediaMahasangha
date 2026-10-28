import Notice from "../models/Notice.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

// CREATE NOTICE (Admin)
export const createNotice = asyncHandler(async (req, res) => {
  const { title, date, websiteLink, isActive } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Notice title is required");
  }

  if (!req.file) {
    throw new ApiError(400, "PDF document is required");
  }

  const uploaded = await uploadToS3(
    req.file.buffer,
    req.file.mimetype,
    "notices"
  );

  const notice = await Notice.create({
    title: title.trim(),
    pdf: {
      url: uploaded.url,
      key: uploaded.key,
    },
    date: date ? new Date(date) : Date.now(),
    websiteLink: (websiteLink || "").trim(),
    isActive: isActive !== undefined ? isActive === "true" || isActive === true : true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, notice, "Notice created successfully"));
});

// GET ALL NOTICES (Public / Paginated / Searchable)
export const getNotices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    all = "false",
  } = req.query;

  const filter = {};

  // Public users only see active notices; admin with all=true sees all
  if (all !== "true") {
    filter.isActive = true;
  }

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: "i" };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(0, parseInt(limit, 10) || 10);

  const total = await Notice.countDocuments(filter);

  let query = Notice.find(filter).sort({ date: -1, createdAt: -1 }).lean();

  if (parsedLimit > 0) {
    query = query.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  }

  const notices = await query;

  const totalPages = parsedLimit > 0 ? Math.ceil(total / parsedLimit) : 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notices,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
      },
      "Notices fetched successfully"
    )
  );
});

// GET SINGLE NOTICE
export const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  return res.status(200).json(new ApiResponse(200, notice, "Notice fetched successfully"));
});

// UPDATE NOTICE (Admin)
export const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  const { title, date, websiteLink, isActive } = req.body;

  if (title !== undefined && title.trim()) {
    notice.title = title.trim();
  }

  if (date !== undefined) {
    notice.date = date ? new Date(date) : notice.date;
  }

  if (websiteLink !== undefined) {
    notice.websiteLink = websiteLink.trim();
  }

  if (isActive !== undefined) {
    notice.isActive = isActive === "true" || isActive === true;
  }

  // If a new PDF file is uploaded, replace the old one
  if (req.file) {
    if (notice.pdf?.key) {
      await deleteFromS3(notice.pdf.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "notices"
    );

    notice.pdf = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await notice.save();

  return res.status(200).json(new ApiResponse(200, notice, "Notice updated successfully"));
});

// DELETE NOTICE (Admin)
export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  if (notice.pdf?.key) {
    await deleteFromS3(notice.pdf.key);
  }

  await Notice.findByIdAndDelete(req.params.id);

  return res.status(200).json(new ApiResponse(200, null, "Notice deleted successfully"));
});
