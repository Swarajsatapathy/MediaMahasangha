import Article from "../models/Article.js";
import Video from "../models/Video.js";
import Member from "../models/Member.js";
import Mentor from "../models/Mentor.js";
import SupremeCouncil from "../models/SupremeCouncil.js";
import WomenCell from "../models/WomenCell.js";
import SrbMember from "../models/SrbMember.js";
import MemberNewsChannel from "../models/MemberNewsChannel.js";
import Gallery from "../models/Gallery.js";
import Notice from "../models/Notice.js";
import Patron from "../models/Patron.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET CONSOLIDATED HOMEPAGE DATA
export const getHomepageData = asyncHandler(async (_req, res) => {
  const [
    articles,
    flashArticles,
    videos,
    members,
    mentors,
    supremeCouncil,
    womenCell,
    srbMembers,
    memberNewsChannels,
    galleryItems,
    notices,
    patrons,
  ] = await Promise.all([
    // 12 latest published web news articles
    Article.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(12)
      .select("title images district reporter publishedAt")
      .lean(),

    // Flash articles for ticker
    Article.find({ isFlash: true, isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(10)
      .select("title publishedAt")
      .lean(),

    // 12 latest published video messages
    Video.find({ isPublished: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(12)
      .select("title thumbnailUrl youtubeUrl district reporter publishedAt")
      .lean(),

    // ALL active members for the homepage slider
    Member.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .select("serialNumber memberId name designation district mobileNumber photo")
      .lean(),

    // Mentors (Advisory Board)
    Mentor.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),

    // Supreme Council
    SupremeCouncil.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),

    // Women Cell
    WomenCell.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),

    // Self Regulatory Body (SRB)
    SrbMember.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),

    // Member News Channels (30 channels)
    MemberNewsChannel.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),

    // Gallery Items (Gallery documents do not have isActive or serialNumber)
    Gallery.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),

    // Notice Board (latest 10)
    Notice.find({ isActive: true })
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean(),

    // Patrons
    Patron.find({ isActive: true })
      .sort({ serialNumber: 1 })
      .lean(),
  ]);

  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=60, stale-while-revalidate=120"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        articles,
        flashArticles,
        videos,
        members,
        mentors,
        supremeCouncil,
        womenCell,
        srbMembers,
        memberNewsChannels,
        galleryItems,
        notices,
        patrons,
      },
      "Homepage data fetched successfully"
    )
  );
});

