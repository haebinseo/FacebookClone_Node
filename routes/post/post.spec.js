require('should');
const request = require('supertest');
const httpMocks = require('node-mocks-http');
const events = require('events');
const path = require('path');
const { app } = require('../../app');

const { sequelize } = require('../../models');
const { join } = require('../auth/auth.ctrl');

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

describe('POST /post/img는', () => {
  before(() => sequelize.sync({ force: true }));
  before(() => join(req, res));

  describe('로그인 되어있을 때', () => {
    const agent = request.agent(app);
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('이미지 서버에 저장후 url을 반환한다.', (done) => {
      agent
        .post('/post/img')
        .attach('image', path.join(__dirname, '../../test.png'))
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          console.log('res.body', response.body);
          response.body.url.should.be.a.String();
          return done();
        });
    });
  });

  describe('로그인 되어있지 않을 때', () => {
    it('GET /unauth 로 redirect 한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('image', path.join(__dirname, '../../test.png'))
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});

describe('POST /post는', () => {
  before(() => sequelize.sync({ force: true }));
  before(() => join(req, res));
  const post = { content: '테스트 중입니당!' };

  describe('로그인 되어있을 때', () => {
    const agent = request.agent(app);
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('게시물 작성후 /로 redirect한다.', (done) => {
      agent.post('/post').send(post).expect(303).expect('Location', '/').end(done);
    });
  });

  describe('로그인 되어있지 않을 때', () => {
    it('GET /unauth 로 redirect 한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('image')
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});

describe('GET /hasgtag는', () => {
  before(() => sequelize.sync({ force: true }));
  before(() => join(req, res));

  describe('로그인 되어있을 때', () => {
    const agent = request.agent(app);
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('아무 태그도 입력되어있지 않으면 GET /로 redirect한다.', (done) => {
      agent.get('/hashtag').expect(303).expect('Locatoin', '/').end(done);
    });

    it('태그가 입력되어 있다면 해당 태그를 포함한 포스트들로 main 페이지를 렌더링해 전송한다.', (done) => {
      agent
        .get('/hashtag?hashtag=test')
        .expect(200)
        .end((err, response) => {
          if (err) return done(err);
          response.should.be.html();
          return done();
        });
    });
  });

  describe('로그인 되어있지 않을 때', () => {
    it('GET /unauth 로 redirect 한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('image')
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});
