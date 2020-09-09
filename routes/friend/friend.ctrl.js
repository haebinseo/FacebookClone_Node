const { User, Friend, Room } = require('../../models');

const addFriend = async (req, res, next) => {
  const targetUID = parseInt(req.params.uid, 10);
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    await user.addFollowing(targetUID, { through: { accepted: false } });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const acceptFriend = async (req, res, next) => {
  const targetUID = parseInt(req.params.uid, 10);
  try {
    const [acceptedFriend] = await req.user.addFollowing(targetUID, {
      through: { accepted: true },
    });
    let requestedFriend = await Friend.findOne({
      where: { followerId: targetUID, followingId: req.user.id },
    });
    requestedFriend.accepted = true;
    requestedFriend = await requestedFriend.save();

    const room = await Room.create({});
    await room.addFriends([acceptedFriend, requestedFriend]);

    res.sendStatus(200);

    // 가입 메시지 생성 및 emit
    const msg = '이제 Messenger에서 친구와 메시지를 주고받을 수 있습니다.';
    const message = await room.createMessage({ content: msg });
    req.app.get('io').of('/user').to(req.user.id).emit('message', message);
    req.app.get('io').of('/user').to(targetUID).emit('message', message);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const unfriend = async (req, res, next) => {
  const targetUID = parseInt(req.params.uid, 10);
  try {
    const friend = await Friend.findOne({
      where: {
        followerId: req.user.id,
        followingId: targetUID,
      },
    });
    const room = await friend.getRoom();
    await room.destroy();
    await friend.destroy();
    await Friend.destroy({
      where: {
        followerId: targetUID,
        followingId: req.user.id,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addFriend, acceptFriend, unfriend };
