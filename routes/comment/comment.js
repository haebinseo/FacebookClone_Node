const router = require('express').Router();
const ctrl = require('./comment.ctrl');

router.post('/', ctrl.comment);

module.exports = router;
