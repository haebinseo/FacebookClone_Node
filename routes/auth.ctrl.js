const { POST } = require('../models');

const homepage = async (req, res) => {
  const posts = await POST.findAll({});
  res.render('main', posts);
};

module.exports = { homepage };
