const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const esImagen = file.mimetype.startsWith('image/');
    const esVideo  = file.mimetype.startsWith('video/');
    return {
      folder: `denuncias_fgr/${req.params.denuncia_id}`,
      resource_type: esVideo ? 'video' : esImagen ? 'image' : 'raw',
      allowed_formats: ['jpg','jpeg','png','pdf','mp4','mp3','wav'],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'image/jpeg','image/png','image/gif',
    'application/pdf',
    'video/mp4','audio/mpeg','audio/wav',
  ];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;