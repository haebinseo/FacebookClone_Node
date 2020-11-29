const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const { createMessage, updateMessage, deleteMessage } = require('../controllers/message.ctrl');

router.post('/room/:roomId', isLoggedIn, createMessage);
router.patch('/:messageId/room/:roomId', isLoggedIn, updateMessage);
router.delete('/:messageId/room/:roomId', isLoggedIn, deleteMessage);

module.exports = router;
