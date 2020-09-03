const router = require('express').Router();
const ctrl = require('./message.ctrl');

router.get('/', ctrl.main);

module.exports = router;
