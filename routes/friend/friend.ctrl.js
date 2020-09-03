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
    const user = await User.findOne({ where: { id: req.user.id } });
    const acceptedFriend = await user.addFollowing(targetUID, {
      through: { accepted: true },
    });
    let requestedFriend = await Friend.findOne({
      where: { followerId: targetUID, followingId: req.user.id },
    });
    requestedFriend.accepted = true;
    requestedFriend = await requestedFriend.save();

    console.log('acceptedFriend : ', acceptedFriend);
    console.log('requestedFriend : ', requestedFriend);

    const room = await Room.create({});
    room.addFriends([acceptedFriend, requestedFriend]);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { addFriend, acceptFriend };
