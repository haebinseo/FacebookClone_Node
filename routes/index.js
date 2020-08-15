const express = require('express');

const router = express.Router();
const ctrl = require('./index.ctrl');

router.get(
  '/',
  (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.render('login');
  },
  ctrl.main,
);

module.exports = router;
