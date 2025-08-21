import multer from "multer";
import fs from "fs"; 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // The directory where temporary files will be stored
        const uploadDir = "./public/temp";
        
        // Use 'fs' to check if the directory exists and create it if it doesn't
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Use the original filename for the temporary file
        cb(null, file.originalname);
    },
});

export const upload = multer({
    storage,
});