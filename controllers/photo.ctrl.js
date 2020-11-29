const { photoDAO } = require('../models');

async function uploadPhotos(req, res, next) {
  try {
    let photos =
      req.files &&
      req.files.map((f) => {
        return { userId: req.user.id, url: `/uploads/${f.filename}` };
      });
    photos = await photoDAO.createPhotos(photos);
    const photoIds = [];
    const urls = [];
    photos.forEach((p) => {
      photoIds.push(p.id);
      urls.push(p.url);
    });
    res.status(201).json({ photoIds, urls });
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

async function deletePhoto(req, res, next) {
  try {
    const args = { userId: req.user.id, photoId: parseInt(req.params.photoId, 10) };
    await photoDAO.deletePhoto(args);
    res.sendStatus(204);
  } catch (error) {
    // console.error(error);
    next(error);
  }
}

module.exports = {
  uploadPhotos,
  deletePhoto,
};
