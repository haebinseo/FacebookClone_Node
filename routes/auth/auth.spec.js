require('should');
const request = require('supertest');
const app = require('../app');
const sequelize = require('../models');
const { User } = require('../models');

describe('POST /auth/login은', () => {
  const users = [
    { email: 'shb0107@gmail.com' },
    { name: '서해빈' },
    { password: 'goqls008?' },
    { gender: 'mail' },
    { birth: new Date(1994, 3, 7) },
  ];
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('성공시', () => {
    it('GET / 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .expect(303)
        .end(done);
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'wrongPassword' })
        .expect(303)
        .end(done);
    });
  });
});

describe('POST /auth/join은', () => {
  const user = {
    email: 'shb0107@gmail.com',
    name: '서해빈',
    password: 'goqls008?',
    gender: 'mail',
    birth: new Date(1994, 3, 7),
  };
  before(() => sequelize.sync({ force: true }));

  describe('성공시', () => {
    it('GET / 로 redirect한다.', (done) => {
      request(app).post('/auth/join').send(user).expect(303).end(done);
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app).post('/auth/join').send(user).expect(303).end(done);
    });
  });
});

describe('POST /auth/logout은', () => {
  const users = [
    { email: 'shb0107@gmail.com' },
    { name: '서해빈' },
    { password: 'goqls008?' },
    { gender: 'mail' },
    { birth: new Date(1994, 3, 7) },
  ];
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('성공시', () => {
    before((done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .end(done);
    });

    it('로그아웃 후 GET / 로 redirect한다.', (done) => {
      request(app).get('/auth/logout').expect(303).end(done);
    });
  });
});
