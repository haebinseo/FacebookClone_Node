const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const { isLoggedIn } = require('./middleware');
const { fetchFriends, fetchPostsWithTag } = require('../controllers/fetchData');
const { createPost } = require('../controllers/createData');
const { renderMain } = require('../controllers/render');

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

router.post('/img', isLoggedIn, upload.single('image'), (req, res) => {
  console.log('req.file: ', req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const argument = {
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    };
    await createPost(argument);
    res.redirect(303, '/');
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

router.get('/hashtag', isLoggedIn, async (req, res, next) => {
  try {
    const { hashtag } = req.query;
    const {
      followingsObj: followings,
      followersObj: followers,
      friends,
    } = await fetchFriends(req.user.id);
    const { posts, likes } = await fetchPostsWithTag(hashtag);
    const argument = {
      title: `${hashtag} | Facebook`,
      followings,
      followers,
      friends,
      posts,
      likes,
    };
    renderMain(req, res, argument);
  } catch (error) {
    // console.error(error);
    next(error);
  }
});

module.exports = router;
