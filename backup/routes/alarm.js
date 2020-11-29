const router = require('express').Router();
const { isLoggedIn } = require('./middleware');
const { updateAlarms } = require('../controllers/updateData');

router.patch('/', isLoggedIn, async (req, res, next) => {
  try {
    const { unreadAlarmIds } = req.body;
    console.log('unreadAlarmIds', unreadAlarmIds);
    const argument = { receiverId: req.user.id, alarmIds: unreadAlarmIds };
    await updateAlarms(argument);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
