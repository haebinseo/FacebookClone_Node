const { Post, Hashtag } = require('../../models');

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
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { img, post };
