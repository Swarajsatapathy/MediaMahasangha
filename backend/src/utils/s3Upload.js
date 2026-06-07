import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import s3 from "../config/s3.js";

const uploadToS3 = async (buffer, mimetype, folder = "uploads") => {
  const fileExtension = mimetype.split("/")[1] || "jpg";
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME.trim(),
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3.send(command);

  const url = `https://${process.env.AWS_BUCKET_NAME.trim()}.s3.${process.env.AWS_REGION.trim()}.amazonaws.com/${fileName}`;

  return {
    url,
    key: fileName,
  };
};

const deleteFromS3 = async (key) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME.trim(),
    Key: key,
  });

  await s3.send(command);
};

export { uploadToS3, deleteFromS3 };