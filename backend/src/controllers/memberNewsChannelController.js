import MemberNewsChannel from "../models/MemberNewsChannel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

const toBoolean = (value) => value === "true" || value === true;

// CREATE MEMBER NEWS CHANNEL
const createMemberNewsChannel = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    odmmRegistrationNo,
    newsChannelName,
    ownerName,
    district,
    mobileNumber,
    email,
    websiteUrl,
    registrationNumber,
    isActive,
  } = req.body;

  if (
    !serialNumber ||
    !odmmRegistrationNo ||
    !newsChannelName ||
    !ownerName ||
    !district ||
    !mobileNumber ||
    !email ||
    !websiteUrl
  ) {
    throw new ApiError(
      400,
      "serialNumber, odmmRegistrationNo, newsChannelName, ownerName, district, mobileNumber, email and websiteUrl are required"
    );
  }

  const parsedSerialNumber = Number(serialNumber);

  if (Number.isNaN(parsedSerialNumber) || parsedSerialNumber < 1) {
    throw new ApiError(
      400,
      "serialNumber must be a valid number greater than 0"
    );
  }

  const existingRegistration = await MemberNewsChannel.findOne({
    odmmRegistrationNo,
  });

  if (existingRegistration) {
    throw new ApiError(409, "ODMM Registration No. already exists");
  }

  const existingSerialNumber = await MemberNewsChannel.findOne({
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
      "member-news-channels"
    );

    photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  const memberNewsChannel = await MemberNewsChannel.create({
    serialNumber: parsedSerialNumber,
    odmmRegistrationNo,
    newsChannelName,
    ownerName,
    district,
    mobileNumber,
    email,
    websiteUrl,
    registrationNumber: registrationNumber || "",
    photo,
    isActive: isActive === undefined ? true : toBoolean(isActive),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        memberNewsChannel,
        "Member news channel created successfully"
      )
    );
});

// GET ALL MEMBER NEWS CHANNELS
const getMemberNewsChannels = asyncHandler(async (req, res) => {
  const {
    district,
    search,
    active,
    sortBy = "serialNumber",
    order = "asc",
  } = req.query;

  const filter = {};

  if (district) {
    filter.district = district;
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  if (search) {
    filter.$or = [
      { odmmRegistrationNo: { $regex: search, $options: "i" } },
      { newsChannelName: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { websiteUrl: { $regex: search, $options: "i" } },
      { registrationNumber: { $regex: search, $options: "i" } },
    ];
  }

  const sortOrder = order === "desc" ? -1 : 1;

  const memberNewsChannels = await MemberNewsChannel.find(filter)
    .sort({ [sortBy]: sortOrder })
    .lean();

  const total = await MemberNewsChannel.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        memberNewsChannels,
        total,
      },
      "Member news channels fetched successfully"
    )
  );
});

// GET SINGLE MEMBER NEWS CHANNEL
const getMemberNewsChannelById = asyncHandler(async (req, res) => {
  const memberNewsChannel = await MemberNewsChannel.findById(req.params.id);

  if (!memberNewsChannel) {
    throw new ApiError(404, "Member news channel not found");
  }

  return res.status(200).json(new ApiResponse(200, memberNewsChannel));
});

// UPDATE MEMBER NEWS CHANNEL
const updateMemberNewsChannel = asyncHandler(async (req, res) => {
  const memberNewsChannel = await MemberNewsChannel.findById(req.params.id);

  if (!memberNewsChannel) {
    throw new ApiError(404, "Member news channel not found");
  }

  const {
    serialNumber,
    odmmRegistrationNo,
    newsChannelName,
    ownerName,
    district,
    mobileNumber,
    email,
    websiteUrl,
    registrationNumber,
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

    if (parsedSerialNumber !== memberNewsChannel.serialNumber) {
      const existingSerialNumber = await MemberNewsChannel.findOne({
        serialNumber: parsedSerialNumber,
        _id: { $ne: memberNewsChannel._id },
      });

      if (existingSerialNumber) {
        throw new ApiError(409, "Serial number already exists");
      }

      memberNewsChannel.serialNumber = parsedSerialNumber;
    }
  }

  if (
    odmmRegistrationNo !== undefined &&
    odmmRegistrationNo !== memberNewsChannel.odmmRegistrationNo
  ) {
    const existingRegistration = await MemberNewsChannel.findOne({
      odmmRegistrationNo,
      _id: { $ne: memberNewsChannel._id },
    });

    if (existingRegistration) {
      throw new ApiError(409, "ODMM Registration No. already exists");
    }

    memberNewsChannel.odmmRegistrationNo = odmmRegistrationNo;
  }

  if (newsChannelName !== undefined) {
    memberNewsChannel.newsChannelName = newsChannelName;
  }

  if (ownerName !== undefined) {
    memberNewsChannel.ownerName = ownerName;
  }

  if (district !== undefined) {
    memberNewsChannel.district = district;
  }

  if (mobileNumber !== undefined) {
    memberNewsChannel.mobileNumber = mobileNumber;
  }

  if (email !== undefined) {
    memberNewsChannel.email = email;
  }

  if (websiteUrl !== undefined) {
    memberNewsChannel.websiteUrl = websiteUrl;
  }

  if (registrationNumber !== undefined) {
    memberNewsChannel.registrationNumber = registrationNumber;
  }

  if (isActive !== undefined) {
    memberNewsChannel.isActive = toBoolean(isActive);
  }

  if (req.file) {
    if (memberNewsChannel.photo && memberNewsChannel.photo.key) {
      await deleteFromS3(memberNewsChannel.photo.key);
    }

    const uploaded = await uploadToS3(
      req.file.buffer,
      req.file.mimetype,
      "member-news-channels"
    );

    memberNewsChannel.photo = {
      url: uploaded.url,
      key: uploaded.key,
    };
  }

  await memberNewsChannel.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        memberNewsChannel,
        "Member news channel updated successfully"
      )
    );
});

// DELETE MEMBER NEWS CHANNEL
const deleteMemberNewsChannel = asyncHandler(async (req, res) => {
  const memberNewsChannel = await MemberNewsChannel.findById(req.params.id);

  if (!memberNewsChannel) {
    throw new ApiError(404, "Member news channel not found");
  }

  if (memberNewsChannel.photo && memberNewsChannel.photo.key) {
    await deleteFromS3(memberNewsChannel.photo.key);
  }

  await memberNewsChannel.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Member news channel deleted successfully"
      )
    );
});

export {
  createMemberNewsChannel,
  getMemberNewsChannels,
  getMemberNewsChannelById,
  updateMemberNewsChannel,
  deleteMemberNewsChannel,
};