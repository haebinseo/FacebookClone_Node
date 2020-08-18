require('should');
const request = require('supertest');
const app = require('../app');
const sequelize = require('../models');
const { User } = require('../models');

describe('GET /는', () => {
  const users = [
    {
      email: 'shb0107@gmail.com',
      name: '서해빈',
      password: 'goqls008?',
      gender: 'mail',
      birth: new Date(1994, 3, 7),
    },
  ];
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('성공시', () => {
    it('200 status code를 반환한다', (done) => {
      request(app).get('/').expect(200).end(done);
    });

    it('html 파일을 반환한다', (done) => {
      request(app)
        .get('/')
        .end((err, res) => {
          if (err) return done(err);
          res.should.be.html();
          return done();
        });
    });
  });

  describe('실패시', () => {
    it('404, error 내용을 담은 html 파일을 반환한다');
  });
});
