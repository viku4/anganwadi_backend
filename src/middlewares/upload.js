import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export const upload = (folderName) => {
  const __filename = fileURLToPath(import.meta.url);

  const __dirname = path.dirname(__filename);
  const uploadPath = path.join(__dirname, `../../uploads/${folderName}`);

  // create folder if not exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {
      recursive: true,
    });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const fileName =
        Date.now() + "-" + Math.round(Math.random() * 9999) + ext;

      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  };

  return multer({
    storage,

    fileFilter,

    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
};
