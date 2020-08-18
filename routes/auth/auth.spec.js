require('should');
const request = require('supertest');
const app = require('../../app');
const { User, sequelize } = require('../../models');

describe('POST /auth/join은', () => {
  const user = {
    email: 'shb0107@gmail.com',
    family_name: '해빈',
    first_name: '서',
    password: 'goqls008?',
    gender: 'male',
    year: 1994,
    month: 4,
    day: 7,
  };
  before(() => sequelize.sync({ force: true }));

  describe('성공시', () => {
    it('GET / 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/join')
        .type('form')
        .send(user)
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/join')
        .send(user)
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});

describe('POST /auth/login은', () => {
  const user = {
    email: 'shb0107@gmail.com',
    family_name: '해빈',
    first_name: '서',
    password: 'goqls008?',
    gender: 'male',
    year: 1994,
    month: 4,
    day: 7,
  };
  before(() => sequelize.sync({ force: true }));

  describe('성공시', () => {
    before((done) => {
      request(app)
        .post('/auth/join')
        .type('form')
        .send(user)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });

    it('GET / 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('실패시', () => {
    it('GET /unauth 로 redirect한다.', (done) => {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({ email: 'shb0107@gmail.com', password: 'wrongPassword' })
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});

describe('POST /auth/logout은', () => {
  const user = {
    email: 'shb0107@gmail.com',
    family_name: '해빈',
    first_name: '서',
    password: 'goqls008?',
    gender: 'male',
    year: 1994,
    month: 4,
    day: 7,
  };
  before(() => sequelize.sync({ force: true }));
  before((done) => {
    request(app)
      .post('/auth/join')
      .type('form')
      .send(user)
      .then(() => {
        request(app)
          .post('/auth/login')
          .type('form')
          .send({ email: 'shb0107@gmail.com', password: 'goqls008?' })
          .end((err) => {
            if (err) return done(err);
            return done();
          });
      })
      .catch((error) => {
        console.error(error);
        done(error);
      });
  });

  describe('성공시', () => {
    it('로그아웃 후 GET / 로 redirect한다.', (done) => {
      request(app)
        .get('/auth/logout')
        .expect(303)
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });
});
