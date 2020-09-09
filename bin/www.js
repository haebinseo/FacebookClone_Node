const { app, sessionMiddleware } = require('../app');
const webSocket = require('../socket');
const syncDB = require('./sync-db');

syncDB().then(() => {
  console.log('Sync database!');
  const server = app.listen(app.get('port'), () =>
    console.log(app.get('port'), '번 포트에서 대기 중'),
  );
  webSocket(server, app, sessionMiddleware);
});
