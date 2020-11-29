const router = require('express').Router();
const fs = require('fs');
const { isLoggedIn, multer } = require('./middleware');
const { uploadPhotos, deletePhoto } = require('../controllers/photo.ctrl');

fs.readdir('uploads', (err) => {
  if (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

router.post('/', isLoggedIn, multer.array('photos', 12), uploadPhotos);
router.delete('/:photoId', isLoggedIn, deletePhoto);

module.exports = router;
