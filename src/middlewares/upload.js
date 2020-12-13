import path from "path";
import multer from "multer";

import ApiError from "../error/ApiError";

export function fileUpload(destination, fileType) {
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(__dirname + destination));
		},
		filename: function (req, file, cb) {
			const fileName =
				new Date().toISOString().slice(0, 10) + "_" + file.originalname;
			cb(null, fileName);
		},
	});

	const fileFilter = (req, file, cb) => {
		if (file.mimetype === fileType[0] || file.mimetype === fileType[1]) {
			cb(null, true);
		} else {
			cb(
				ApiError.badRequest(
					`Only supports ${fileType[0]} and ${fileType[1]} formats.`,
				),
				false,
			);
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
}
