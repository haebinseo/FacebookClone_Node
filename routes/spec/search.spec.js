require('should-http');
const request = require('supertest');
const should = require('should');
const { app } = require('../../app');

const { sequelize } = require('../../db/models');

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
const posts = [
  { content: '테스트 중입니당!' },
  { content: '테스트 중입니당!! #test' },
  { content: '테스트 중입니당!!!2 #test2' },
  { content: '테스트 중입니당!!!3 #test2' },
];

describe('GET /search/hashtag?hashtag=... 는 ', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[1]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[2]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[3]);
  });

  let res;
  it('status code 200(Ok)을 보낸다.', async () => {
    res = await agent.get('/search/hashtag?hashtag=test').expect(200);
  });

  it('해당 문자열을 포함한 자동완성 후보들의 배열을 반환한다.', () => {
    res.should.be.json();
    const autocompletions = res.body;
    autocompletions.should.be.an.instanceof(Array);
    autocompletions.should.have.length(2);
  });
});

describe('GET /search/post/hashtag?hashtag=... 는 ', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[1]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[2]);
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[3]);
  });

  it('해당 태그가 포함된 post들을 포함한 main 페이지와 함께 status code 200(Ok)을 보낸다.', (done) => {
    agent
      .get('/search/post/hashtag?hashtag=test')
      .expect(200)
      .end((err, res) => {
        res.should.be.html();
        done();
      });
  });
});
