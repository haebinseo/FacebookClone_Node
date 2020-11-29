const router = require('express').Router();
const fs = require('fs');

const { isLoggedIn, multer } = require('./middleware');
// const { fetchFriends, fetchPostsWithTag } = require('../controllers/fetchData');
const { createPhotos } = require('../controllers/createData');
const { deletePhoto } = require('../controllers/deleteData');

fs.readdir('uploads', (err) => {
  if (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});

router.get('/:filename', isLoggedIn, (req, res) => {
  // console.log('req.file: ', req.files);
  // const urls = req.files.map((f) => `/photo/${f.filename}`);
  // res.json({ urls });
});

router.post('/', isLoggedIn, multer.array('photos', 12), async (req, res, next) => {
  try {
    // console.log('req.files: ', req.files);
    let photos = req.files.map((f) => {
      return { userId: req.user.id, url: `/uploads/${f.filename}` };
    });
    photos = await createPhotos(photos);
    const photoIds = [];
    const urls = [];
    photos.forEach((p) => {
      photoIds.push(p.id);
      urls.push(p.url);
    });
    res.json({ photoIds, urls });
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.delete('/:pid', isLoggedIn, async (req, res, next) => {
  try {
    const { pid: photoId } = req.params;

    const argument = { userId: req.user.id, photoId: parseInt(photoId, 10) };
    await deletePhoto(argument);
    res.sendStatus(200);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;
