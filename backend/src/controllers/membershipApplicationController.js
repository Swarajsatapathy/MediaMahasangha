import MembershipApplication from "../models/MembershipApplication.js";
import { uploadToS3 } from "../utils/s3Upload.js";
import { notificationService } from "../utils/notificationService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Generate Application ID
const generateApplicationId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await MembershipApplication.countDocuments();
  const nextNumber = String(count + 1).padStart(6, "0");
  return `ODMM-APP-${currentYear}-${nextNumber}`;
};

export const createApplication = asyncHandler(async (req, res) => {
  const {
    name,
    dateOfBirth,
    bloodGroup,
    mobileNumber,
    whatsappNumber,
    whatsappSameAsMobile,
    email,
    address,
    district,
    blockOrNac,
    policeStation,
    pincode,
    newsAgencyName,
    nomineeName,
    paymentDate,
    paymentUtr,
    declarationAccepted,
    paymentConfirmationAccepted,
  } = req.body;

  if (
    !name ||
    !dateOfBirth ||
    !bloodGroup ||
    !mobileNumber ||
    !whatsappNumber ||
    !email ||
    !address ||
    !district ||
    !pincode ||
    !paymentDate ||
    !paymentUtr ||
    declarationAccepted !== "true" ||
    paymentConfirmationAccepted !== "true"
  ) {
    throw new ApiError(400, "All required fields must be provided.");
  }

  // Check duplicates
  const existingApp = await MembershipApplication.findOne({
    $or: [{ mobileNumber }, { email }],
  });

  if (existingApp) {
    if (existingApp.applicationStatus === "PENDING") {
      throw new ApiError(
        400,
        "An application using this mobile or email is already under review."
      );
    }
    if (existingApp.applicationStatus === "APPROVED") {
      throw new ApiError(
        400,
        "An application using this mobile or email has already been approved."
      );
    }
  }

  if (!req.file) {
    throw new ApiError(400, "Photo is required.");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new ApiError(400, "Only JPG, JPEG, and PNG formats are allowed.");
  }

  if (req.file.size > 5 * 1024 * 1024) {
    throw new ApiError(400, "Photo size should not exceed 5MB.");
  }

  // Upload to S3
  const uploadedPhoto = await uploadToS3(
    req.file.buffer,
    req.file.mimetype,
    "membership-applications"
  );

  const applicationId = await generateApplicationId();

  const newApp = await MembershipApplication.create({
    applicationId,
    name,
    dateOfBirth,
    bloodGroup,
    mobileNumber,
    whatsappNumber,
    whatsappSameAsMobile: whatsappSameAsMobile === "true",
    email,
    address,
    district,
    blockOrNac,
    policeStation,
    pincode,
    newsAgencyName,
    nomineeName,
    photo: uploadedPhoto,
    declarationAccepted: true,
    declarationAcceptedAt: new Date(),
    paymentAmount: 300,
    paymentDate,
    paymentUtr,
    paymentConfirmationAccepted: true,
    paymentStatus: "PENDING_VERIFICATION",
    applicationStatus: "PENDING",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { application: newApp }, "Application submitted successfully"));
});

export const getApplications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    paymentStatus,
    district,
    search,
  } = req.query;

  const query = {};

  if (status && status !== "All") query.applicationStatus = status;
  if (paymentStatus && paymentStatus !== "All") query.paymentStatus = paymentStatus;
  if (district && district !== "All") query.district = district;

  if (search) {
    query.$or = [
      { applicationId: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { newsAgencyName: { $regex: search, $options: "i" } },
    ];
  }

  const applications = await MembershipApplication.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await MembershipApplication.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        total,
      },
      "Applications fetched successfully"
    )
  );
});

export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await MembershipApplication.findById(req.params.id)
    .populate("reviewedBy", "name email")
    .populate("paymentVerifiedBy", "name email")
    .populate("createdMemberRecordId");

  if (!application) {
    throw new ApiError(404, "Application not found.");
  }

  return res.status(200).json(new ApiResponse(200, application, "Application fetched successfully"));
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const application = await MembershipApplication.findById(req.params.id);

  if (!application) throw new ApiError(404, "Application not found");

  application.paymentStatus = "VERIFIED";
  application.paymentVerifiedAt = new Date();
  application.paymentVerifiedBy = req.admin._id;
  if (remarks) application.paymentVerificationRemarks = remarks;

  await application.save();

  return res.status(200).json(new ApiResponse(200, application, "Payment verified"));
});

export const rejectPayment = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const application = await MembershipApplication.findById(req.params.id);

  if (!application) throw new ApiError(404, "Application not found");

  application.paymentStatus = "REJECTED";
  application.paymentVerifiedAt = new Date();
  application.paymentVerifiedBy = req.admin._id;
  if (remarks) application.paymentVerificationRemarks = remarks;

  await application.save();

  return res.status(200).json(new ApiResponse(200, application, "Payment rejected"));
});

export const approveApplication = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  const application = await MembershipApplication.findById(req.params.id);

  if (!application) throw new ApiError(404, "Application not found");
  if (application.applicationStatus !== "PENDING") {
    throw new ApiError(400, "Application is not in PENDING state.");
  }
  if (application.paymentStatus !== "VERIFIED") {
    throw new ApiError(400, "Payment must be verified before approval.");
  }

  application.applicationStatus = "APPROVED";
  application.reviewedAt = new Date();
  application.reviewedBy = req.admin._id;
  if (remarks) application.adminRemarks = remarks;

  await application.save();

  // Send notifications
  await notificationService.sendEmail({
    to: application.email,
    subject: "ODMM Membership Application Approved",
    text: `Dear ${application.name},\n\nYour ODMM membership application has been approved.\n\nApplication ID: ${application.applicationId}\n\nYour official member record will now be processed by the ODMM administration.\n\nRegards,\nOdisha Digital Media Mahasangha (ODMM)`,
  });

  await notificationService.sendWhatsApp({
    to: application.whatsappNumber,
    text: `Dear ${application.name}, Your ODMM membership application has been approved. Application ID: ${application.applicationId}. Your official member record will now be processed by the ODMM administration.`,
  });

  await notificationService.sendSMS({
    to: application.mobileNumber,
    text: `Dear ${application.name}, Your ODMM membership application has been approved. App ID: ${application.applicationId}. Regards, ODMM`,
  });

  return res.status(200).json(new ApiResponse(200, application, "Application approved successfully"));
});

export const rejectApplication = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  if (!remarks) throw new ApiError(400, "Rejection remarks are required.");

  const application = await MembershipApplication.findById(req.params.id);

  if (!application) throw new ApiError(404, "Application not found");
  if (application.applicationStatus !== "PENDING") {
    throw new ApiError(400, "Application is not in PENDING state.");
  }

  application.applicationStatus = "REJECTED";
  application.reviewedAt = new Date();
  application.reviewedBy = req.admin._id;
  application.adminRemarks = remarks;

  await application.save();

  // Send notifications
  await notificationService.sendEmail({
    to: application.email,
    subject: "ODMM Membership Application Update",
    text: `Dear ${application.name},\n\nYour ODMM membership application (ID: ${application.applicationId}) has been rejected for the following reason:\n\n${remarks}\n\nRegards,\nOdisha Digital Media Mahasangha (ODMM)`,
  });

  await notificationService.sendWhatsApp({
    to: application.whatsappNumber,
    text: `Dear ${application.name}, Your ODMM membership application (ID: ${application.applicationId}) has been rejected. Reason: ${remarks}.`,
  });

  await notificationService.sendSMS({
    to: application.mobileNumber,
    text: `Dear ${application.name}, Your ODMM application (ID: ${application.applicationId}) has been rejected. Reason: ${remarks}.`,
  });

  return res.status(200).json(new ApiResponse(200, application, "Application rejected successfully"));
});

export const getCreateMemberData = asyncHandler(async (req, res) => {
  const application = await MembershipApplication.findById(req.params.id);

  if (!application) throw new ApiError(404, "Application not found");
  if (application.applicationStatus !== "APPROVED") {
    throw new ApiError(400, "Application must be APPROVED to create a member.");
  }
  if (application.memberCreated) {
    throw new ApiError(400, "Member has already been created from this application.");
  }

  const prefillData = {
    name: application.name,
    district: application.district,
    mobileNumber: application.mobileNumber,
    photo: application.photo,
  };

  return res.status(200).json(new ApiResponse(200, prefillData, "Prefill data fetched successfully"));
});
