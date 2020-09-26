require('should-http');
const request = require('supertest');
const { app } = require('../../app');
const { sequelize, User, Post, Comment } = require('../../db/models');

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
];
const comments = [
  { content: '테스트 댓글입니다', pid: null, depth: 0, bundleCreatedAt: null },
  { content: '테스트 댓글입니다2', pid: null, depth: 0, bundleCreatedAt: null },
  { content: '테스트 대댓글입니다', pid: null, depth: 1, bundleCreatedAt: null },
];

describe('POST /like/post/:pid는', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before((done) => {
    request(app)
      .post('/auth/join')
      .type('form')
      .send(users[0])
      .end(() => {
        request(app)
          .post('/auth/join')
          .type('form')
          .send(users[1])
          .end(() => {
            request(app).post('/auth/join').type('form').send(users[2]).end(done);
          });
      });
  });
  // login and post a post
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1.post('/post').send(posts[0]).end(done);
      });
  });
  // login with user 1
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(done);
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.post('/like/post/1').expect(200).end(done);
    });

    it('해당 user와 post 간에 LikePost 관계를 생성한다.', async () => {
      const user = await User.findOne({
        where: { id: 2 },
        include: [
          {
            model: Post,
            as: 'PostLikeds',
          },
        ],
      });
      user.PostLikeds.should.have.length(1);
      user.PostLikeds[0].id.should.be.equal(1);
    });
  });

  describe('존재하지 않는 게시물에 like를 줄 때', () => {
    it('status code 404를 보낸다.', (done) => {
      agent2.post('/like/post/2').expect(404).end(done);
    });
  });
});

describe('POST /like/comment/:cid는', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before((done) => {
    request(app)
      .post('/auth/join')
      .type('form')
      .send(users[0])
      .end(() => {
        request(app)
          .post('/auth/join')
          .type('form')
          .send(users[1])
          .end(() => {
            request(app).post('/auth/join').type('form').send(users[2]).end(done);
          });
      });
  });
  // login and post a post and a comment
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1
          .post('/post')
          .send(posts[0])
          .end(() => {
            comments[0].pid = 1;
            agent1
              .post('/comment')
              .set('Content-Type', 'application/json')
              .send(comments[0])
              .end(done);
          });
      });
  });
  // login with user 1
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(done);
  });
  // init comments
  after(() => {
    comments[0].pid = null;
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.post('/like/comment/1').expect(200).end(done);
    });

    it('해당 user와 comment 간에 LikeComment 관계를 생성한다.', async () => {
      const user = await User.findOne({
        where: { id: 2 },
        include: [
          {
            model: Comment,
            as: 'CommentLikeds',
          },
        ],
      });
      user.CommentLikeds.should.have.length(1);
      user.CommentLikeds[0].id.should.be.equal(1);
    });
  });

  describe('존재하지 않는 댓글에 like를 줄 때', () => {
    it('status code 404를 보낸다.', (done) => {
      agent2.post('/like/comment/2').expect(404).end(done);
    });
  });
});

describe('DELETE /like/post/:pid는', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before((done) => {
    request(app)
      .post('/auth/join')
      .type('form')
      .send(users[0])
      .end(() => {
        request(app)
          .post('/auth/join')
          .type('form')
          .send(users[1])
          .end(() => {
            request(app).post('/auth/join').type('form').send(users[2]).end(done);
          });
      });
  });
  // login and post two posts
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1
          .post('/post')
          .send(posts[0])
          .end(() => {
            agent1.post('/post').send(posts[1]).end(done);
          });
      });
  });
  // login with user 1 and give likes to both posts
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        agent2.post('/like/post/1').end(() => {
          agent2.post('/like/post/2').end(done);
        });
      });
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.delete('/like/post/1').expect(200).end(done);
    });

    it('해당 user와 post 간에 LikePost 관계가 더이상 존재하지 않는다.', async () => {
      const user = await User.findOne({
        where: { id: 2 },
        include: [
          {
            model: Post,
            as: 'PostLikeds',
          },
        ],
      });
      const postIdsLiked = user.PostLikeds.map((p) => p.id);
      console.log('postIdsLiked: ', postIdsLiked);
      postIdsLiked.includes(1).should.not.be.ok();
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 like를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent2.delete('/like/post/1').expect(404).end(done);
    });

    it('다른 유저의 like를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent1.delete('/like/post/2').expect(404).end(done);
    });
  });
});

describe('DELETE /like/comment/:cid는', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before((done) => {
    request(app)
      .post('/auth/join')
      .type('form')
      .send(users[0])
      .end(() => {
        request(app)
          .post('/auth/join')
          .type('form')
          .send(users[1])
          .end(() => {
            request(app).post('/auth/join').type('form').send(users[2]).end(done);
          });
      });
  });
  // login and post a post and two comments
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1
          .post('/post')
          .send(posts[0])
          .end(() => {
            comments[0].pid = 1;
            comments[1].pid = 1;
            agent1
              .post('/comment')
              .set('Content-Type', 'application/json')
              .send(comments[0])
              .end(() => {
                agent1
                  .post('/comment')
                  .set('Content-Type', 'application/json')
                  .send(comments[1])
                  .end(done);
              });
          });
      });
  });
  // login with user 1 and give likes to both comments
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        agent2.post('/like/comment/1').end(() => {
          agent2.post('/like/comment/2').end(done);
        });
      });
  });
  // init comments
  after(() => {
    comments[0].pid = null;
    comments[1].pid = null;
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.delete('/like/comment/1').expect(200).end(done);
    });

    it('해당 user와 comment 간에 LikeComment 관계가 더이상 존재하지 않는다.', async () => {
      const user = await User.findOne({
        where: { id: 2 },
        include: [
          {
            model: Comment,
            as: 'CommentLikeds',
          },
        ],
      });
      const commentIdsLiked = user.CommentLikeds.map((c) => c.id);
      // console.log('commentIdsLiked: ', commentIdsLiked);
      commentIdsLiked.includes(1).should.not.be.ok();
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 like를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent2.delete('/like/comment/1').expect(404).end(done);
    });

    it('다른 유저의 like를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent1.delete('/like/comment/2').expect(404).end(done);
    });
  });
});
