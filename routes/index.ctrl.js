const { Post, User, Sequelize, Friend, Room, Message } = require('../models');

const main = async (req, res, next) => {
  try {
    // friends
    const followingsObj = {};
    const followingsArr = await Friend.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId', 'accepted', 'roomId'],
    });
    followingsArr.forEach(function (following) {
      followingsObj[following.followingId] = [following.accepted, following.roomId];
    });

    const followersObj = {};
    const followersArr = await Friend.findAll({
      where: { followingId: req.user.id },
      attributes: ['followerId', 'accepted', 'roomId'],
    });
    followersArr.forEach(function (follower) {
      followersObj[follower.followerId] = [follower.accepted, follower.roomId];
    });

    // posts
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'profileImg'],
        },
        {
          model: User,
          attributes: ['id', 'name'],
          as: 'UserWhoLikePosts',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    const userWhoLikePosts = {}; // [0: user.id, 1: user.name]
    let comments = [];
    const userWhoLikeComments = {};
    if (posts) {
      posts.forEach((post) => {
        userWhoLikePosts[post.id] = [
          post.UserWhoLikePosts.map((user) => user.id),
          post.UserWhoLikePosts.map((user) => user.name),
        ];
      });

      comments = await Promise.all(
        posts.map((post) => {
          return post.getComments({
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'profileImg'],
              },
              {
                model: User,
                attributes: ['id', 'name'],
                as: 'UserWhoLikeComments',
              },
            ],
            order: [[Sequelize.literal('bundleCreatedAt, createdAt'), 'ASC']],
          });
        }),
      );

      comments.forEach((commentsInAPost) => {
        commentsInAPost.forEach((comment) => {
          userWhoLikeComments[comment.id] = [
            comment.UserWhoLikeComments.map((user) => user.id),
            comment.UserWhoLikeComments.map((user) => user.name),
          ];
        });
      });
    }
    // console.log('user', req.user);
    // console.log('user.Followings', req.user.Followings[0]);
    // console.log('user.Followers', req.user.Followers[0]);
    // console.log('posts[0].UserWhoLikePosts', posts[0].UserWhoLikePosts);
    // console.log('posts[0].UserWhoLikePosts[0].LikePost', posts[0].UserWhoLikePosts[0].LikePost);

    res.render('main', {
      title: 'Facebook',
      user: req.user,
      followings: followingsObj,
      followers: followersObj,
      posts,
      comments,
      userWhoLikePosts,
      userWhoLikeComments,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const unauth = (req, res) => {
  res.render('login', {
    title: 'Facebook - 로그인 또는 가입',
    loginError: req.flash('loginError'),
    joinError: req.flash('joinError'),
  });
};

const messenger = async (req, res, next) => {
  try {
    // 친구 조회
    const friends = await req.user.getFollowings({
      through: {
        where: { accepted: true },
        attributes: ['createdAt', 'roomId'],
      },
    });

    if (friends.length === 0) {
      res.render('messengerLayout', {
        title: 'Messenger | Facebook',
        user: req.user,
      });
    } else {
      // 가장 최근의 메시지 하나를 포함한 채팅 방 객체 조회
      const roomIds = friends.map((f) => f.friend.roomId);
      const rooms = await Room.findAll({
        where: { id: { [Sequelize.Op.in]: roomIds } },
        include: [
          {
            model: Message,
            order: [['createdAt', 'DESC']],
            limit: 1,
          },
        ],
      });

      // 가장 메시지가 최근인 채팅방 탐색
      const indexOfLatest = rooms.reduce((imax, r, i, rs) => {
        if (r.messages.length === 0) return imax;
        return r.messages[0].createdAt > rs[imax].messages[0].createdAt ? i : imax;
      }, 0);

      res.redirect(`/messenger/${rooms[indexOfLatest].id}`);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const messengerRoom = async (req, res, next) => {
  try {
    const targetRID = parseInt(req.params.rid, 10);

    // 친구 조회
    const friends = await req.user.getFollowings({
      through: {
        where: { accepted: true },
        attributes: ['createdAt', 'roomId'],
      },
    });

    // 가장 최근의 메시지 하나를 포함한 채팅 방 객체 조회
    const roomIds = friends.map((f) => f.friend.roomId);
    const rooms = await Room.findAll({
      where: { id: { [Sequelize.Op.in]: roomIds } },
      include: [
        {
          model: Message,
          order: [['createdAt', 'DESC']],
          paranoid: false,
          limit: 1,
        },
      ],
    });

    // 가장 최근에 메시지를 주고받은 순으로 정렬
    rooms.sort((r1, r2) => {
      const { createdAt: createdAt1 } = r1.messages[0];
      const { createdAt: createdAt2 } = r2.messages[0];

      if (createdAt1 > createdAt2) return -1;
      if (createdAt1 < createdAt2) return 1;
      return 0;
    });

    // room 객체에 친구 객체 추가
    const friendsObj = {};
    friends.forEach((f) => {
      friendsObj[f.friend.roomId] = f;
    });
    rooms.forEach((r) => Object.assign(r, { user: friendsObj[r.id] }));

    // 현재 room의 message 조회
    let currentRoom = {};
    let currentRoomIdx;
    rooms.forEach((r, i) => {
      if (r.id === targetRID) {
        currentRoom = r;
        currentRoomIdx = i;
      }
    });
    let messages = await currentRoom.getMessages({
      paranoid: false,
      order: [['createdAt', 'ASC']],
    });
    messages.forEach((m) => {
      if (!m.isRead) m.isRead = true;
    });
    messages = await Promise.all(messages.map((m) => m.save()));

    // console.log('messages', messages);

    res.render('messenger', {
      title: 'Messenger | Facebook',
      user: req.user,
      rooms,
      currentRoom,
      currentRoomIdx,
      messages,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { main, unauth, messenger, messengerRoom };
