import path from "path";
import multer from "multer";

import ApiError from "../errors/ApiError";

const fileUpload = (destination, fileType) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname + destination));
    },
    filename: function (req, file, cb) {
      const { aud } = req.jwt;
      const fileName =
        aud +
        "_" +
        new Date().toISOString().slice(0, 10) +
        "_" +
        file.originalname;
      cb(null, fileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (fileType.length === 0) {
      cb(null, true);
    } else {
      if (
        file.mimetype === fileType[0] ||
        file.mimetype === fileType[1] ||
        file.mimetype === fileType[2]
      ) {
        cb(null, true);
      } else {
        cb(
          ApiError.badRequest(
            `Only supports ${fileType[0]} ,${fileType[1]} and ${fileType[2]} formats.`,
          ),
          false,
        );
      }
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
  });

  return upload;
};

export default fileUpload;
