const { User, Post, Hashtag } = require('../../models');

const img = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

const post = async (req, res, next) => {
  try {
    const newPost = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) =>
          Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          }),
        ),
      );
      await newPost.addHashtags(result.map((r) => r[0]));
    }
    res.redirect(303, '/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const tagSearch = async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) return res.redirect('/');
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) posts = await hashtag.getPosts({ include: [{ model: User }] });
    return res.render('main', {
      title: `${query} | Facebook`,
      user: req.user,
      posts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { img, post, tagSearch };
