const { Photo } = require('../db/models');

/* ===================================  READ  =================================== */
const fetchPhotosWithUser = async (targetUserId) => {
  return Photo.findAll({
    where: { userId: targetUserId },
    order: [['createdAt', 'DESC']],
  });
};

/* ===================================  CREATE  =================================== */
const createPhotos = async (photos) => {
  return Photo.bulkCreate(photos);
};

/* ===================================  UPDATE  =================================== */

/* ===================================  DELETE  =================================== */
const deletePhoto = async ({ userId, photoId }) => {
  const photo = await Photo.findOne({ where: { id: photoId } });
  if (!photo || photo.userId !== userId) {
    const err = new Error(photo ? 'Forbidden' : 'Not Found');
    err.status = photo ? 403 : 404;
    throw err;
  }

  await photo.destroy();
};

module.exports = {
  fetchPhotosWithUser,
  createPhotos,
  deletePhoto,
};
