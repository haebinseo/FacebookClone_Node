const { Message } = require('../../db/models');

const postMessage = async (req, res, next) => {
  try {
    const roomId = req.params.rid;
    const { content, friendId } = req.body;
    const newMsg = await req.user.createMessage({ content, roomId });
    console.log('content, friendId', content, friendId);

    const io = req.app.get('io');
    io.of('/user').to(req.user.id).to(friendId).emit('message', newMsg);
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
    const { fid: friendId } = req.query;
    let targetMsg = await Message.findOne({ where: { id: msgId } });
    targetMsg.content = '메시지 보내기를 취소했습니다';
    targetMsg = await targetMsg.save();
    await targetMsg.destroy();
    // console.log('targetMsg', targetMsg);
    const io = req.app.get('io');
    io.of('/user').to(req.user.id).to(friendId).emit('deleteMsg', targetMsg);
    io.of('/chat').to(roomId).emit('deleteMsg', targetMsg);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { postMessage, deleteMessage };
