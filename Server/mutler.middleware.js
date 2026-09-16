import multer from "multer";

// const storage = multer.diskStorage({
//     destination : function(req , file , cb){
//         cb(null , './public/temp')
//     },
//     filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, file.originalname + '-' + uniqueSuffix)
//   }
// });

const MAX_SIZE = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed.'));
        }
    }
});