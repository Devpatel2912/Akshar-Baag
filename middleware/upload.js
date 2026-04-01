const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = 'upload/';
const videoDir = 'upload/videos/';
const noteImageDir = 'upload/notesimage/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}
if (!fs.existsSync(noteImageDir)) {
    fs.mkdirSync(noteImageDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith('video/') || 
                       /mp4|mkv|mov|avi|wmv/.test(path.extname(file.originalname).toLowerCase());
        
        const isNote = req.baseUrl.includes('notes') || req.originalUrl.includes('notes');

        if (isVideo) {
            cb(null, videoDir);
        } else if (isNote) {
            cb(null, noteImageDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 500 * 1024 * 1024 // Increased to 500MB to allow for HD videos
    },
    fileFilter: (req, file, cb) => {
        const imageTypes = /jpeg|jpg|png|webp|heic|heif/;
        const videoTypes = /mp4|mkv|mov|avi|wmv/;
        
        const isImage = imageTypes.test(path.extname(file.originalname).toLowerCase()) || 
                       file.mimetype.startsWith('image/');
        const isVideo = videoTypes.test(path.extname(file.originalname).toLowerCase()) || 
                       file.mimetype.startsWith('video/');

        if (isImage || isVideo) {
            return cb(null, true);
        }
        
        cb(new Error('Only images and videos are allowed'));
    }
});

module.exports = upload;
