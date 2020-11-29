const Multer = require('multer');
const path = require('path');
const render = require('../controllers/render');

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) next();
  else render.login(req, res);
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) next();
  else res.redirect(303, '/');
};

const multer = Multer({
  storage: Multer.diskStorage({
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

module.exports = { isLoggedIn, isNotLoggedIn, multer };
