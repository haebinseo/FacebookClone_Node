const { User, Friend, Room, Sequelize } = require('../../models');

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
    const user = await User.findOne({ where: { id: req.user.id } });
    const [acceptedFriend] = await user.addFollowing(targetUID, {
      through: { accepted: true },
    });
    let requestedFriend = await Friend.findOne({
      where: { followerId: targetUID, followingId: req.user.id },
    });
    requestedFriend.accepted = true;
    requestedFriend = await requestedFriend.save();

    const room = await Room.create({});
    await room.addFriends([acceptedFriend, requestedFriend]);

    // console.log('acceptedFriend : ', acceptedFriend);
    // console.log('requestedFriend : ', requestedFriend);

    res.sendStatus(200);
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
