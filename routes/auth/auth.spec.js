require('should');
const request = require('supertest');
const httpMocks = require('node-mocks-http');
const events = require('events');
const { app } = require('../../app');

const { sequelize } = require('../../models');
const { join } = require('./auth.ctrl');

const users = [
  {
    email: 'shb0107@gmail.com',
    family_name: '해빈',
    first_name: '서',
    password: 'testpwd',
    gender: 'male',
    year: 1994,
    month: '4월',
    day: 7,
  },
  {
    email: 'shb0107@gmail.com',
    family_name: '이메일',
    first_name: '중복',
    password: 'testpwd2',
    gender: 'male',
    year: 1994,
    month: '4월',
    day: 7,
  },
];
const req = httpMocks.createRequest({
  method: 'POST',
  url: '/join',
  body: users[0],
});
const res = httpMocks.createResponse({
  eventEmitter: events.EventEmitter,
});

describe('POST /auth/join은', () => {
  before(() => sequelize.sync({ force: true }));

  describe('성공시', () => {
    it('GET / 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/join')
        .type('form')
        .send(users[0])
        .expect(303)
        .expect('Location', '/')
        .end(done);
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/join')
        .type('form')
        .send(users[1])
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});

describe('POST /auth/login은', () => {
  before(() => sequelize.sync({ force: true }));
  before(() => join(req, res));

  describe('성공시', () => {
    it('GET / 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .expect(303)
        .expect('Location', '/')
        .end(done);
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[1].password })
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});

describe('POST /auth/logout은', () => {
  before(() => sequelize.sync({ force: true }));
  before(() => join(req, res));

  describe('성공시', () => {
    it('로그아웃 후 GET /unauth 로 redirect한다.', (done) => {
      const agent = request.agent(app);
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password });
      agent.get('/auth/logout').expect(303).expect('Location', '/unauth').end(done);
    });
  });
});
