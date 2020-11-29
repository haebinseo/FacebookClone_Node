require('should-http');
const request = require('supertest');
const path = require('path');
const should = require('should');
const { app } = require('../../app');

const { sequelize, User, Post, Photo, Comment } = require('../../db/models');

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
const testPhoto = {
  name: 'test.png',
  path: path.join(__dirname, '../../test.png'),
};
const comments = [
  { content: '테스트 댓글입니다' },
  { content: '테스트 댓글입니다2' },
  { content: '테스트 대댓글입니다' },
];

describe('POST /post는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
  });

  describe('성공시', () => {
    let photoIds;
    before(async () => {
      ({
        body: { photoIds },
      } = await agent.post('/photo').attach('photos', testPhoto.path, testPhoto.name));
      photoIds = photoIds.join(',');
    });

    it('status code 201(Created)을 보낸다.', (done) => {
      agent
        .post('/post')
        .set('Content-Type', 'application/json')
        .send({ content: posts[0].content, photoIds })
        .expect(201)
        .end(done);
    });

    it('게시물은 posts 테이블에 저장된다.', async () => {
      const postResult = await Post.findOne({
        include: Photo,
      });
      should.exist(postResult);
      // console.log('postResult: ', postResult.dataValues);
    });
  });
});

describe('PATCH /post/:postId', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent.post('/user/join').type('form').send(users[1]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
  });

  describe('성공시', () => {
    let photoIds;
    before(async () => {
      // post a photo
      ({
        body: { photoIds },
      } = await agent.post('/photo').attach('photos', testPhoto.path, testPhoto.name));
      photoIds = photoIds.join(',');
      // post a post
      await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    });

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent
        .patch('/post/1')
        .set('Content-Type', 'application/json')
        .send({ content: posts[1].content, photoIds })
        .expect(204)
        .end(done);
    });

    it('posts 테이블의 해당 게시글 record에 수정사항이 반영된다.', async () => {
      const postResult = await Post.findOne({
        where: { id: 1 },
        include: [{ model: Photo }],
      });
      should.exist(postResult);
      postResult.content.should.be.equal(posts[1].content);
      postResult.photos.should.have.length(1);
      // console.log('postResult: ', postResult.dataValues);
    });
  });

  describe('실패시', () => {
    const agent2 = request.agent(app);
    before((done) => {
      agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('다른 사용자의 post 수정을 시도할 때 status code 403(Forbidden)을 보낸다.', (done) => {
      agent2
        .patch('/post/1')
        .set('Content-Type', 'application/json')
        .send(posts[2])
        .expect(403)
        .end(done);
    });

    it('존재하지 않는 post 수정을 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent2
        .patch('/post/999')
        .set('Content-Type', 'application/json')
        .send(posts[2])
        .expect(404)
        .end(done);
    });
  });
});

describe('DELETE /post/:postId', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent.post('/user/join').type('form').send(users[1]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
  });

  describe('성공시', () => {
    before(async () => {
      // post a photo
      await agent.post('/photo').attach('photos', testPhoto.path, testPhoto.name);
      // post a post
      await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    });

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent.delete('/post/1').expect(204).end(done);
    });

    it('posts 테이블에 삭제한 게시글의 record가 존재하지 않아야 한다.', async () => {
      const postResult = await Post.findOne({
        where: { id: 1 },
      });
      should.not.exist(postResult);
    });

    it('photo 테이블에 삭제한 게시글에 포함된 사진의 record가 존재하지 않아야 한다.', async () => {
      const photosResult = await Photo.findAll({
        where: { postId: 1 },
      });
      photosResult.should.have.length(0);
    });
  });

  describe('실패시', () => {
    const agent2 = request.agent(app);
    before(async () => {
      // post a post
      await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
      await agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password });
    });

    it('다른 사용자의 post 삭제를 시도할 때 status code 403(Forbidden)을 보낸다.', (done) => {
      agent2.delete('/post/2').expect(403).end(done);
    });

    it('존재하지 않는 post 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent2.delete('/post/999').expect(404).end(done);
    });
  });
});

describe('POST /post/:postId/comment는', () => {
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
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
  });

  describe('성공시', () => {
    it('status code 201(Created)을 보낸다.', (done) => {
      agent
        .post('/post/1/comment')
        .set('Content-Type', 'application/json')
        .send(comments[0])
        .expect(201)
        .end(done);
    });

    it('작성된 댓글은 comments 테이블에 저장된다.', async () => {
      const commentResult = await Comment.findOne({ where: { id: 1 } });
      should.exist(commentResult);
      commentResult.postId.should.be.equal(1);
      console.log('postResult: ', commentResult.dataValues);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 게시글에 댓글 작성을 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent
        .post('/post/999/comment')
        .set('Content-Type', 'application/json')
        .send(comments[0])
        .expect(404)
        .end(done);
    });
  });
});

describe('PATCH /post/:postId/comment/:commentId는', () => {
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
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    // post a comment
    await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[0]);
  });

  describe('성공시', () => {
    it('status code 204(No Content)를 보낸다.', (done) => {
      agent
        .patch('/post/1/comment/1')
        .set('Content-Type', 'application/json')
        .send(comments[1])
        .expect(204)
        .end(done);
    });

    it('comments 테이블의 해당 댓글 record에 수정사항이 반영된다.', async () => {
      const commentResult = await Comment.findOne({ where: { id: 1 } });
      should.exist(commentResult);
      commentResult.content.should.be.equal(comments[1].content);
      console.log('postResult: ', commentResult.dataValues);
    });
  });

  describe('실패시', () => {
    const agent2 = request.agent(app);
    before((done) => {
      agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('다른 사용자의 댓글 수정을 시도할 때 status code 403(Forbidden)을 보낸다.', (done) => {
      agent2.patch('/post/1/comment/1').expect(403).end(done);
    });

    it('존재하지 않는 댓글 수정을 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent2.patch('/post/1/comment/999').expect(404).end(done);
    });
  });
});

describe('DELETE /post/:postId/comment/:commentId는', () => {
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
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    // post comments
    await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[0]);
    await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[1]);
    // post a reply
    await agent.post('/post/1/comment/2').set('Content-Type', 'application/json').send(comments[2]);
  });

  describe('성공시', () => {
    it('status code 204(No Content)를 보낸다.', (done) => {
      agent.delete('/post/1/comment/1').expect(204).end(done);
    });

    it('comments 테이블에 삭제한 댓글의 record가 존재하지 않아야 한다.', async () => {
      const commentResult = await Comment.findOne({ where: { id: 1 } });
      should.not.exist(commentResult);
    });
  });

  describe('실패시', () => {
    const agent2 = request.agent(app);
    before(async () => {
      await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[0]);
      await agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password });
    });

    it('다른 사용자의 댓글 삭제를 시도할 때 status code 403(Forbidden)을 보낸다.', (done) => {
      agent2.delete('/post/1/comment/2').expect(403).end(done);
    });

    it('존재하지 않는 댓글 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent2.delete('/post/1/comment/999').expect(404).end(done);
    });

    it('대댓글이 달려있는 댓글 삭제를 시도할 때 status code 409(Conflict)을 보낸다.', (done) => {
      agent.delete('/post/1/comment/2').expect(409).end(done);
    });
  });
});

describe('POST /post/:postId/like는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    // join
    await agent.post('/user/join').type('form').send(users[0]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
  });

  describe('성공시', () => {
    it('status code 201(Created)을 보낸다.', (done) => {
      agent.post('/post/1/like').expect(201).end(done);
    });

    it('LikePost 관계 테이블에 생성된 like의 record가 저장된다.', async () => {
      const userResult = await User.findOne({
        where: { id: 1 },
        include: [
          {
            model: Post,
            as: 'PostsLiked',
            through: [],
          },
        ],
      });
      should.exist(userResult);
      userResult.PostsLiked.should.have.length(1);
      should.exist(userResult.PostsLiked[0].LikePost);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 게시글에 like 생성을 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.post('/post/999/like').expect(404).end(done);
    });
  });
});

describe('DELETE /post/:postId/like는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    // join
    await agent.post('/user/join').type('form').send(users[0]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    // post a like
    await agent.post('/post/1/like');
  });

  describe('성공시', () => {
    it('status code 204(No Content)을 보낸다.', (done) => {
      agent.delete('/post/1/like').expect(204).end(done);
    });

    it('LikePost 관계 테이블에 삭제된 like의 record가 존재하지 않는다.', async () => {
      const userResult = await User.findOne({
        where: { id: 1 },
        include: [
          {
            model: Post,
            as: 'PostsLiked',
            through: [],
          },
        ],
      });
      should.exist(userResult);
      userResult.PostsLiked.should.have.length(0);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 게시글에 like 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/post/999/like').expect(404).end(done);
    });

    it('존재하지 않는 like 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/post/1/like').expect(404).end(done);
    });
  });
});

describe('POST /post/:postId/comment/:commentId/like는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    // join
    await agent.post('/user/join').type('form').send(users[0]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    // post a comment
    await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[0]);
  });

  describe('성공시', () => {
    it('status code 201(Created)을 보낸다.', (done) => {
      agent.post('/post/1/comment/1/like').expect(201).end(done);
    });

    it('LikePost 관계 테이블에 생성된 like의 record가 저장된다.', async () => {
      const userResult = await User.findOne({
        where: { id: 1 },
        include: [
          {
            model: Comment,
            as: 'CommentsLiked',
            through: [],
          },
        ],
      });
      should.exist(userResult);
      userResult.CommentsLiked.should.have.length(1);
      should.exist(userResult.CommentsLiked[0].LikeComment);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 댓글에 like 생성을 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.post('/post/1/comment/999/like').expect(404).end(done);
    });
  });
});

describe('DELETE /post/:postId/comment/:commentId/like는', () => {
  before(() => sequelize.sync({ force: true }));
  const agent = request.agent(app);
  before(async () => {
    // join
    await agent.post('/user/join').type('form').send(users[0]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    // post a post
    await agent.post('/post').set('Content-Type', 'application/json').send(posts[0]);
    // post a comment
    await agent.post('/post/1/comment').set('Content-Type', 'application/json').send(comments[0]);
    // post a like
    await agent.post('/post/1/comment/1/like');
  });

  describe('성공시', () => {
    it('status code 204(No Content)을 보낸다.', (done) => {
      agent.delete('/post/1/comment/1/like').expect(204).end(done);
    });

    it('LikePost 관계 테이블에 삭제된 like의 record가 존재하지 않는다.', async () => {
      const userResult = await User.findOne({
        where: { id: 1 },
        include: [
          {
            model: Comment,
            as: 'CommentsLiked',
            through: [],
          },
        ],
      });
      should.exist(userResult);
      userResult.CommentsLiked.should.have.length(0);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 댓글에 like 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/post/1/comment/999/like').expect(404).end(done);
    });

    it('존재하지 않는 like 삭제를 시도할 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/post/1/comment/1/like').expect(404).end(done);
    });
  });
});
