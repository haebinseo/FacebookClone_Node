require('should-http');
const request = require('supertest');
// const httpMocks = require('node-mocks-http');
// const events = require('events');
const path = require('path');
const fs = require('fs');
const { app } = require('../../app');

const { sequelize, Post } = require('../../db/models');
// const { join } = require('../../controllers/authentication');

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
const posts = [
  { content: '테스트 중입니당!' },
  { content: '테스트 중입니당!! #test' },
  { content: '테스트 중입니당!!!2 #test2' },
];

// const req = httpMocks.createRequest({
//   method: 'POST',
//   url: '/join',
//   body: users[0],
// });
// const res = httpMocks.createResponse({
//   eventEmitter: events.EventEmitter,
// });

describe('POST /post/img는', () => {
  before(() => sequelize.sync({ force: true }));
  before((done) => {
    request(app).post('/auth/join').type('form').send(users[0]).end(done);
  });

  describe('로그인 되어있을 때', () => {
    const agent = request.agent(app);
    let url;
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
          console.log('res.body: ', response.body);
          url = response.body.url;
          url.should.be.a.String();
          return done();
        });
    });

    it('해당 파일이 upload폴더에 존재해야 한다.', () => {
      const fileName = url.split('/')[2];
      const filePath = path.join(__dirname, '../../uploads', fileName);
      console.log('filePath: ', filePath);
      const fileExists = fs.existsSync(filePath);
      fileExists.should.be.ok();
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
  before((done) => {
    request(app).post('/auth/join').type('form').send(users[0]).end(done);
  });

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
      agent.post('/post').send(posts[0]).expect(303).expect('Location', '/').end(done);
    });

    it('게시물은 posts 테이블에 저장된다.', async () => {
      const postResult = await Post.findOne();
      postResult.should.be.an.instanceOf(Object);
      console.log('postResult: ', postResult.dataValues);
    });
  });

  describe('로그인 되어있지 않을 때', () => {
    it('GET /unauth 로 redirect 한다.', (done) => {
      request(app)
        .post('/post')
        .send(posts[0])
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});

describe('GET /hasgtag는', () => {
  before(() => sequelize.sync({ force: true }));
  // join
  before((done) => {
    request(app).post('/auth/join').type('form').send(users[0]).end(done);
  });

  describe('로그인 되어있을 때', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });
    // post posts
    before((done) => {
      agent
        .post('/post')
        .send(posts[0])
        .end(() => {
          agent
            .post('/post')
            .send(posts[1])
            .end(() => {
              agent.post('/post').send(posts[2]).end(done);
            });
        });
    });

    it('해당 태그를 포함한 포스트들로 main 페이지를 렌더링해 전송한다.', (done) => {
      agent
        .get('/post/hashtag?hashtag=test')
        .expect(200)
        .end(async (err, response) => {
          if (err) return done(err);
          response.should.be.html();
          return done();
        });
    });
  });

  describe('로그인 되어있지 않을 때', () => {
    it('GET /unauth 로 redirect 한다.', (done) => {
      request(app)
        .get('/post/hashtag?hashtag=test')
        .expect(303)
        .expect('Location', '/unauth')
        .end(done);
    });
  });
});
