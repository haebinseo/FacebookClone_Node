require('should-http');
const request = require('supertest');
const httpMocks = require('node-mocks-http');
const events = require('events');

const { app } = require('../../app');
const { sequelize } = require('../../db/models');
const { join } = require('../../controllers/authentication');

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

describe('GET /는', () => {
  before(() => sequelize.sync({ force: true }));

  describe('로그인 되어있을 시', () => {
    const agent = request.agent(app);
    before(() => join(req, res));
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('200 status code를 반환한다', (done) => {
      agent.get('/').expect(200).end(done);
    });

    it('main 페이지를 렌더링해 반환한다', (done) => {
      agent.get('/').end((err, response) => {
        if (err) return done(err);
        response.should.be.html();
        return done();
      });
    });
  });

  describe('로그인 되어있지 않을 시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app).get('/').expect(303).expect('Location', '/unauth').end(done);
    });
  });
});

describe('GET /unauth는', () => {
  before(() => sequelize.sync({ force: true }));

  describe('로그인 되어있지 않을 시', () => {
    it('unauth 페이지를 렌더링해 반환한다.', (done) => {
      request(app)
        .get('/unauth')
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          response.should.be.html();
          return done();
        });
    });
  });

  describe('로그인 되어있을 시', () => {
    const agent = request.agent(app);
    before(() => join(req, res));
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('GET / 로 redirect 한다.', (done) => {
      agent.get('/unauth').expect(303).expect('Location', '/').end(done);
    });
  });
});
