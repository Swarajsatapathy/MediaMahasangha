import multer from "multer";

const storage = multer.memoryStorage();

const pdfUpload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Only PDF documents (.pdf) are allowed"), false);
    }

    cb(null, true);
  },
});

export default pdfUpload;
