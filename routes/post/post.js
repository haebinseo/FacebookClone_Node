const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const ctrl = require('./post.ctrl');
const { isLoggedIn } = require('../middleware');

fs.readdir('uploads', (err) => {
  if (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const upload2 = multer();

router.post('/img', isLoggedIn, upload.single('image'), ctrl.img);
router.post('/', isLoggedIn, upload2.none(), ctrl.post);

module.exports = router;
