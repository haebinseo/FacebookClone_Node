const { Photo, Sequelize } = require('../db/models');

/* ===================================  READ  =================================== */
const fetchPhotosWithUser = async (targetUserId) => {
  return Photo.findAll({
    where: { userId: targetUserId },
    order: [['createdAt', 'DESC']],
  });
};

/* ===================================  CREATE  =================================== */
const createPhotos = async (photos) => {
  if (!photos) {
    const err = new Error('Not Found');
    err.status = 404;
    throw err;
  }

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

const deletePhotos = async ({ userId, photoIds }) => {
  const photos = await Photo.fineAll({
    where: {
      id: { [Sequelize.Op.in]: photoIds },
    },
  });
  const numPhotosOfOthers = photos.filter((p) => p.userId !== userId).length;
  if (numPhotosOfOthers || photos.length !== photoIds.length) {
    const err = new Error(numPhotosOfOthers ? 'Forbidden' : 'Not Found');
    err.status = numPhotosOfOthers ? 403 : 404;
    throw err;
  }

  await Photo.destroy({ where: { id: { [Sequelize.Op.in]: photoIds } } });
};

module.exports = {
  fetchPhotosWithUser,
  createPhotos,
  deletePhoto,
  deletePhotos,
};
