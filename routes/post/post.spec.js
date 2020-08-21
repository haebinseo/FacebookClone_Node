require('should');
const request = require('supertest');
const path = require('path');
const bcrypt = require('bcrypt');
const app = require('../../app');
const { User, sequelize } = require('../../models');

describe('POST /post/img는', () => {
  const hash = bcrypt.hashSync('goqls008?', 12);
  const user = {
    email: 'shb0107@gmail.com',
    name: '서해빈',
    password: hash,
    gender: 'male',
    birth: new Date(1994, 3, 7),
  };
  let cookie;
  before(() => sequelize.sync({ force: true }));
  before(() => User.create(user));

  describe('성공시', () => {
    // 로그인
    before((done) => {
      request(app)
        .post('/auth/login')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .expect(303)
        .end((err, res) => {
          if (err) return done(err);
          // 로그인 성공후 세션 정보를 cookie에 설정
          cookie = res.headers['set-cookie'];
          return done();
        });
    });

    it('이미지 서버에 저장후 url을 반환한다.', (done) => {
      request(app)
        .post('/post/img')
        .set('cookie', cookie)
        .attach('image', path.join(__dirname, '../../test.png'))
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          console.log('res.body', res.body);
          res.body.url.should.be.a.String();
          return done();
        });
    });
  });

  describe('실패시', () => {
    it('로그인 되지 않았을 시 303 status code를 반환한다.', (done) => {
      request(app)
        .post('/post/img')
        .attach('test-image')
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});

// describe('POST /post는', () => {
//   const users = [
//     {
//       email: 'shb0107@gmail.com',
//       name: '서해빈',
//       password: 'goqls008?',
//       gender: 'mail',
//       birth: new Date(1994, 3, 7),
//     },
//   ];
//   const posts = [
//     {
//       content: '테스트 중입니당!',
//       url: '',
//     },
//   ];
//   before(() => sequelize.sync({ force: true }));
//   before(() => User.bulkCreate(users));

//   describe('성공시', () => {
//     before((done) => {
//       request(app)
//         .post('/auth/login')
//         .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
//         .then(() => {
//           request(app)
//             .post('/post/img')
//             .attach('test-image', path.join(__dirname, '../../test.png'))
//             .end((err, res) => {
//               if (err) return done(err);
//               posts[0].url = res.body.url;
//               return done();
//             });
//         })
//         .catch((error) => {
//           console.error(error);
//           done(error);
//         });
//     });

//     it('게시물 작성후 /로 redirect한다.', (done) => {
//       request(app)
//         .post('/post')
//         .send(posts)
//         .expect(303)
//         .end((err) => {
//           if (err) return done(err);
//           return done();
//         });
//     });
//   });

//   describe('실패시', () => {
//     it('로그인 되지 않았을 경우 401 status code를 반환한다.', (done) => {
//       request(app)
//         .post('/post/img')
//         .attach('test-image')
//         .expect(401)
//         .end((err) => {
//           if (err) return done(err);
//           return done();
//         });
//     });
//   });
// });
