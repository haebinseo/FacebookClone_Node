require('should');
const request = require('supertest');
const path = require('path');
const bcrypt = require('bcrypt');
const app = require('../../app');
const { User, sequelize } = require('../../models');

describe('POST /friend/:uid/add는', () => {
  const hash = [
    bcrypt.hashSync('testpassword1', 12),
    bcrypt.hashSync('testpassword2', 12),
  ];
  const users = [
    {
      email: 'shb0107@gmail.com',
      name: '서해빈',
      password: hash[0],
      gender: 'male',
      birth: new Date(1994, 3, 7),
    },
    {
      email: 'peh1@gmail.com',
      name: '박은희',
      password: hash[1],
      gender: 'female',
      birth: new Date(1998, 9, 12),
    },
  ];
  let cookie;
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('성공시', () => {
    // 로그인
    before((done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'testpassword1' })
        .expect(303)
        .end((err, res) => {
          if (err) return done(err);
          // 로그인 성공후 세션 정보를 cookie에 설정
          cookie = res.headers['set-cookie'];
          return done();
        });
    });

    it('게시물 작성후 /로 redirect한다.', (done) => {
      request(app)
        .post('/friend/2/add')
        .set('cookie', cookie)
        .send()
        .expect(200)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
