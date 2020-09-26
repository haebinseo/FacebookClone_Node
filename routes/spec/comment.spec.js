require('should-http');
const request = require('supertest');
const { app } = require('../../app');
const { sequelize, Comment } = require('../../db/models');

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

describe('POST /comment는', () => {
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
    comments[1].pid = null;
    comments[2].pid = null;
    comments[1].bundleCreatedAt = null;
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', async () => {
      // post two comments.
      comments[0].pid = 1;
      comments[1].pid = 2;
      comments[2].pid = 1;
      await agent2
        .post('/comment')
        .set('Content-Type', 'application/json')
        .send(comments[0])
        .expect(200);
      await agent2
        .post('/comment')
        .set('Content-Type', 'application/json')
        .send(comments[1])
        .expect(200);
      // post a re-comment.
      const comment0 = await Comment.findOne({ where: { id: 1 } });
      comments[2].bundleCreatedAt = comment0.bundleCreatedAt;
      await new Promise((resolve) =>
        // give a time gap between comment and re-comment
        setTimeout(() => {
          agent2
            .post('/comment')
            .set('Content-Type', 'application/json')
            .send(comments[2])
            .expect(200)
            .end(resolve);
        }, 1000),
      );
    });

    it('해당 userId, postId를 가지는 comment를 생성한다.', async () => {
      const commentsResult = await Comment.findAll();
      commentsResult.should.have.length(3);
      commentsResult.forEach((comment, idx) => {
        console.log(`comments[${idx}]: `, comment.dataValues);
        comment.userId.should.be.equal(2);
        comment.postId.should.be.equal(comments[idx].pid);
        comment.depth.should.be.equal(comments[idx].depth);
        if (comments[idx].bundleCreatedAt) {
          // eslint-disable-next-line prettier/prettier
          comment.bundleCreatedAt
            .getTime()
            .should.be.equal(comments[idx].bundleCreatedAt.getTime());
        }
      });
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 게시물에 comment를 작성할 때 status code 404를 보낸다.', (done) => {
      comments[0].pid = 3;
      agent2
        .post('/comment')
        .set('Content-Type', 'application/json')
        .send(comments[0])
        .expect(404)
        .end(done);
    });
  });

  // describe('존재하지 않는 comment에 re-comment를 작성할 때', () => {
  //   it('status code 404를 보낸다.', (done) => {
  //     comments[0].pid = 0;
  //     agent2
  //       .post('/comment')
  //       .set('Content-Type', 'application/json')
  //       .send(comments[0])
  //       .expect(404)
  //       .end(done);
  //   });
  // });
});

describe('POST /comment/update/:cid는', () => {
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
  // login with user 1 and post a comment
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        comments[0].pid = 1;
        agent2
          .post('/comment')
          .set('Content-Type', 'application/json')
          .send(comments[0])
          .expect(200)
          .end(done);
      });
  });
  // init comments
  after(() => {
    comments[0].pid = null;
  });

  describe('성공시', () => {
    const content = '수정된 댓글입니다!';
    it('status code 200을 보낸다.', (done) => {
      agent2
        .post('/comment/update/1')
        .set('Content-Type', 'application/json')
        .send({ content })
        .expect(200)
        .end(done);
    });

    it('해당 comment의 content가 수정되어 저장된다.', async () => {
      const commentResult = await Comment.findOne();
      // console.log('commentResult: ', commentResult.dataValues);
      commentResult.id.should.be.equal(1);
      commentResult.content.should.be.equal(content);
    });
  });

  describe('실패시', () => {
    const content = '수정된 댓글입니다!!! 222';
    it('존재하지 않는 댓글의 수정을 시도할 때 status code 404를 보낸다.', (done) => {
      agent2
        .post('/comment/update/2')
        .set('Content-Type', 'application/json')
        .send({ content })
        .expect(404)
        .end(done);
    });

    it('다른 사용자의 댓글 수정을 시도할 때 status code 403를 보낸다.', (done) => {
      agent1
        .post('/comment/update/1')
        .set('Content-Type', 'application/json')
        .send({ content })
        .expect(403)
        .end(done);
    });
  });
});

describe('DELETE /comment/:cid는', () => {
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
  // login with user 1 and post two comments and one re-comment.
  const agent2 = request.agent(app);
  before(async () => {
    // login
    await agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password });
    // post comments
    comments[0].pid = 1;
    comments[1].pid = 2;
    comments[2].pid = 1;
    await agent2
      .post('/comment')
      .set('Content-Type', 'application/json')
      .send(comments[0]);
    await agent2
      .post('/comment')
      .set('Content-Type', 'application/json')
      .send(comments[1]);
    const comment0 = await Comment.findOne({ where: { id: 1 } });
    comments[2].bundleCreatedAt = comment0.bundleCreatedAt;
    await new Promise((resolve) =>
      // give a time gap between comment and re-comment
      setTimeout(() => {
        agent2
          .post('/comment')
          .set('Content-Type', 'application/json')
          .send(comments[2])
          .end(resolve);
      }, 1000),
    );
  });
  // init comments
  after(() => {
    comments[0].pid = null;
    comments[1].pid = null;
    comments[2].pid = null;
    comments[2].bundleCreatedAt = null;
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.delete('/comment/2').expect(200).end(done);
    });

    it('해당 comment가 더이상 존재하지 않는다.', async () => {
      const commentsResult = await Comment.findAll();
      const commentIds = commentsResult.map((c) => c.id);
      console.log('commentIds: ', commentIds);
      commentIds.includes(2).should.not.be.ok();
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 comment를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent2.delete('/comment/2').expect(404).end(done);
    });

    it('다른 유저의 comment를 삭제하고자 할 때 status code 403을 보낸다.', (done) => {
      agent1.delete('/comment/3').expect(403).end(done);
    });

    // it('re-comment가 존재하는 comment를 삭제하고자 할 때 status code 409을 보낸다.', (done) => {
    //   agent1.delete('/like/delete/3').expect(409).end(done);
    // });
  });
});
