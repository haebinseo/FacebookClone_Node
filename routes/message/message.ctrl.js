const { User, Message } = require('../../models');

const main = async (req, res, next) => {
  const user = await User.findOne({
    where: { id: req.user.id },
    include: {
      model: User,
      as: 'followings',
      where: { accepted: true },
    },
  });
  const msg = await Message.findAll({ where: { userId: req.user.id } });

  res.render('message', {
    title: 'Messenger | Facebook',
    user,
    msg,
  });
};

module.exports = { main };
