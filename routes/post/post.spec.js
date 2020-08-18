require('should');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../app');
const sequelize = require('../../models');
const { User } = require('../../models');

describe('POST /post/img는', () => {
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
    before((done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    it('이미지 서버에 저장후 url을 반환한다.', async (done) => {
      try {
        const imgBuffer = await fs.readFile(path.join(__dirname, '../../test.png'), (err, buf) => {
          if (err) throw err;
          return buf;
        });
        request(app)
          .post('/post/img')
          .attach('test-image', imgBuffer)
          .end((err, res) => {
            if (err) return done(err);
            res.body.url.should.be.a('string');
            console.log(res.body.url);
            return done();
          });
      } catch (error) {
        console.error(error);
      }
    });
  });

  describe('실패시', () => {
    it('로그인 되지 않았을 시 401 status code를 반환한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('test-image')
        .expect(401)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});

describe('POST /post는', () => {
  const users = [
    {
      email: 'shb0107@gmail.com',
      name: '서해빈',
      password: 'goqls008?',
      gender: 'mail',
      birth: new Date(1994, 3, 7),
    },
  ];
  const posts = [
    {
      content: '테스트 중입니당!',
      url: '',
    },
  ];
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('성공시', () => {
    before((done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .then(() => {
          request(app)
            .post('/post/img')
            .attach('test-image', path.join(__dirname, '../../test.png'))
            .end((err, res) => {
              if (err) return done(err);
              posts[0].url = res.body.url;
              return done();
            });
        })
        .catch((error) => {
          console.error(error);
          done(error);
        });
    });

    it('게시물 작성후 /로 redirect한다.', (done) => {
      request(app)
        .post('/post')
        .send(posts)
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('실패시', () => {
    it('로그인 되지 않았을 경우 401 status code를 반환한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('test-image')
        .expect(401)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
