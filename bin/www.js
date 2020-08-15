const app = require('../app');
const syncDB = require('./sync-db');

syncDB().then(() => {
  console.log('Sync database!');
  app.listen(app.get('port'), () => console.log(app.get('port'), '번 포트에서 대기 중'));
});
