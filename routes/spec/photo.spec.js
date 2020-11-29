const should = require('should');
require('should-http');
const request = require('supertest');
const path = require('path');
const { app } = require('../../app');
const { sequelize, User, Friend, Room, Message, Alarm, Photo } = require('../../db/models');

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
    email: 'peh1@gmail.com',
    family_name: '은희',
    first_name: '박',
    password: 'testpwd2',
    gender: 'female',
    year: 1998,
    month: '9월',
    day: 12,
  },
  {
    email: 'jyy@gmail.com',
    family_name: '정엽',
    first_name: '유',
    password: 'testpwd3',
    gender: 'male',
    year: 1994,
    month: '1월',
    day: 3,
  },
];
const testPhoto = {
  name: 'test.png',
  path: path.join(__dirname, '../../test.png'),
};

describe('POST /photo는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
  });
  let photoIds;
  let urls;

  describe('성공시', () => {
    it('저장된 사진의 id와 url의 배열과 함께 status code 201(Created)을 보낸다.', (done) => {
      agent
        .post('/photo')
        .attach('photos', testPhoto.path, testPhoto.name)
        .expect(201)
        .end((err, res) => {
          ({ photoIds, urls } = res.body);
          should.exist(photoIds);
          should.exist(urls);
          console.log(`photoIds: ${photoIds}, urls: ${urls}`);
          done();
        });
    });

    it('photos 테이블에 업로드한 사진의 record가 존재해야 한다.', async () => {
      const photo = await Photo.findOne({ where: { userId: 1 } });
      should.exist(photo);
      photo.id.should.be.equal(photoIds[0]);
      photo.url.should.be.equal(urls[0]);
    });
  });

  describe('실패시', () => {
    it('사진이 누락되었을 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.post('/photo').attach().expect(404).end(done);
    });
  });
});

describe('DELETE /photo/:photoId는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    // join
    await agent.post('/user/join').type('form').send(users[0]);
    await agent.post('/user/join').type('form').send(users[1]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    // post a photo
    await agent.post('/photo').attach('photos', testPhoto.path, testPhoto.name);
  });

  describe('성공시', () => {
    it('status code 204(No Content)를 보낸다.', (done) => {
      agent.delete('/photo/1').expect(204).end(done);
    });

    it('photos 테이블에 삭제한 사진의 record가 존재하지 않아야 한다.', async () => {
      const photo = await Photo.findOne({ where: { id: 1 } });
      should.not.exist(photo);
    });
  });

  describe('실패시', () => {
    const agent2 = request.agent(app);
    before(async () => {
      // login with another user
      await agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password });
      // post a photo
      await agent2.post('/photo').attach('photos', testPhoto.path, testPhoto.name);
    });

    it('다른 사용자의 사진 삭제를 시도할 시 status code 403(Forbidden)을 보낸다.', (done) => {
      agent.delete('/photo/2').expect(403).end(done);
    });

    it('존재하지 않는 사진 삭제를 시도할 시 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/photo/999').expect(404).end(done);
    });
  });
});
