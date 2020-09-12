const { Message } = require('../../models');

const postMessage = async (req, res, next) => {
  try {
    const roomId = req.params.rid;
    const { content, friendId } = req.body;
    const newMsg = await req.user.createMessage({ content, roomId });

    const io = req.app.get('io');
    io.of('/user').to(friendId).emit('message', newMsg);
    io.of('/chat').to(roomId).emit('message', newMsg);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { rid: roomId, mid: msgId } = req.params;
    let targetMsg = await Message.findOne({ where: { id: msgId } });
    targetMsg.content = '메시지 보내기를 취소했습니다';
    targetMsg = await targetMsg.save();
    req.app.get('io').of('/chat').to(roomId).emit('deleteMsg', targetMsg);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { postMessage, deleteMessage };
