const multer = require('multer');
const MulterError = require('multer').MulterError;
const path = require('path');
const sharp = require('sharp');

// Types MIME autorisés pour les images
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

module.exports = (req, res, next) => {
  const config = {
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "image/png" && file.mimetype !== "image/jpeg") {
        return cb(new MulterError("LIMIT_INVALID_TYPE"));
      }

      return cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 2,
    },
    storage: multer.memoryStorage(),

  }
  const upload = multer(config).single('image');

  upload(req, res, async (err) => {
    if (err) {
      try {
        switch (err.code) {
          case "LIMIT_INVALID_TYPE":
            throw new Error("Invalid file type! Only PNG and JPEG are allowed");

          case "LIMIT_FILE_SIZE":
            throw new Error("File size is too large! Max size is 2MB");

          default:
            throw new Error("Something went wrong!");
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
        return;
      }
    }
    try {
      if (!req.file) {
        return next(); // Aucune image => on continue sans traitement d'image
      }
      
      try {
        const filename = `${Date.now()}-${req.file.originalname.split(' ').join('_')}.jpg`;
        const outputPath = path.join(__dirname, '..', 'pictures', filename);
      
        await sharp(req.file.buffer)
          .resize({ width: 536 })
          .jpeg({ quality: 70 })
          .toFile(outputPath);
      
        req.file.filename = filename;
        next();
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }
    catch (error) {
      res.status(400).json({ message: error.message });
      return;
    }
  })
}