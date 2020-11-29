const should = require('should');
require('should-http');
const request = require('supertest');
const sinon = require('sinon');
const { app } = require('../../app');
const { sequelize, Message, Sequelize } = require('../../db/models');

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
const messages = [
  { content: '테스트 메시지입니다!', userId: 1, roomId: 1 },
  { content: '테스트 메시지입니다!!2', userId: 2, roomId: 1 },
  { content: '테스트 메시지입니다!!!3', userId: 3, roomId: 2 },
];

describe('POST /message/room/:rid', () => {
  before(() => sequelize.sync({ force: true }));
  // mocking socket communication
  let io;
  before(() => {
    io = sinon.stub(app, 'get');
    io.withArgs('io').returns({
      of: sinon.stub().returnsThis(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub().returns(),
    });
    app.get.callThrough();
  });
  after(() => io.restore());
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
  // login with user 0 and send friend requests to user 1 and 2
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1.post('/friend/add/2').end(() => {
          agent1.post('/friend/add/3').end(done);
        });
      });
  });
  // login with user 1 and accept the friend request
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        agent2.post('/friend/accept/1').end(done);
      });
  });
  // login with user 2 and accept the friend request
  const agent3 = request.agent(app);
  before((done) => {
    agent3
      .post('/auth/login')
      .type('form')
      .send({ email: users[2].email, password: users[2].password })
      .end(() => {
        agent3.post('/friend/accept/1').end(done);
      });
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      // post three messages
      agent1
        .post(`/message/room/${messages[0].roomId}`)
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(200)
        .end(() => {
          agent2
            .post(`/message/room/${messages[1].roomId}`)
            .set('Content-Type', 'application/json')
            .send({ content: messages[1].content })
            .expect(200)
            .end(() => {
              agent3
                .post(`/message/room/${messages[2].roomId}`)
                .set('Content-Type', 'application/json')
                .send({ content: messages[2].content })
                .expect(200)
                .end(done);
            });
        });
    });

    it('해당 userId, roomId를 가지는 message를 생성한다.', async () => {
      const messagesResult = await Message.findAll({
        where: {
          userId: { [Sequelize.Op.ne]: null },
        },
      });
      messagesResult.should.have.length(3);
      messagesResult.forEach((message, idx) => {
        // console.log(`messages[${idx}]: `, message.dataValues);
        message.userId.should.be.equal(messages[idx].userId);
        message.roomId.should.be.equal(messages[idx].roomId);
        message.content.should.be.equal(messages[idx].content);
      });
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 chatting room에 message를 작성할 때 status code 404를 보낸다.', (done) => {
      agent2
        .post('/message/room/3')
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(404)
        .end(done);
    });

    it('user가 소속되지 않은 chatting room에 message를 작성할 때 status code 403를 보낸다.', (done) => {
      agent2
        .post('/message/room/2')
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(403)
        .end(done);
    });
  });
});

describe('POST /message/update/:mid/room/:rid는', () => {
  before(() => sequelize.sync({ force: true }));
  // mocking socket communication
  let io;
  before(() => {
    io = sinon.stub(app, 'get');
    io.withArgs('io').returns({
      of: sinon.stub().returnsThis(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub().returns(),
    });
    app.get.callThrough();
  });
  after(() => io.restore());
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
  // login with user 0 and send friend requests to user 1 and 2
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1.post('/friend/add/2').end(() => {
          agent1.post('/friend/add/3').end(done);
        });
      });
  });
  // login with user 1 and accept the friend request
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        agent2.post('/friend/accept/1').end(done);
      });
  });
  // login with user 2 and accept the friend request
  const agent3 = request.agent(app);
  before((done) => {
    agent3
      .post('/auth/login')
      .type('form')
      .send({ email: users[2].email, password: users[2].password })
      .end(() => {
        agent3.post('/friend/accept/1').end(done);
      });
  });
  // post three messages
  before((done) => {
    agent1
      .post(`/message/room/${messages[0].roomId}`)
      .set('Content-Type', 'application/json')
      .send({ content: messages[0].content })
      .end(() => {
        agent2
          .post(`/message/room/${messages[1].roomId}`)
          .set('Content-Type', 'application/json')
          .send({ content: messages[1].content })
          .end(() => {
            agent3
              .post(`/message/room/${messages[2].roomId}`)
              .set('Content-Type', 'application/json')
              .send({ content: messages[2].content })
              .end(done);
          });
      });
  });

  describe('성공시', () => {
    const content = '수정된 메시지입니다!';
    it('status code 200을 보낸다.', async () => {
      await new Promise((resolve) =>
        // give a time gap between creation and update
        setTimeout(() => {
          agent2
            .post('/message/update/4/room/1')
            .set('Content-Type', 'application/json')
            .send({ content })
            .expect(200)
            .end(resolve);
        }, 1000),
      );
    });

    it('해당 message의 content가 수정되어 저장된다.', async () => {
      const messageResult = await Message.findOne({ where: { id: 4 } });
      // console.log('messageResult: ', messageResult.dataValues);
      messageResult.content.should.be.equal(content);
      should.notEqual(
        messageResult.updatedAt.getTime(),
        messageResult.createdAt.getTime(),
      );
    });
  });

  describe('실패시', () => {
    const content = '수정된 댓글입니다!!! 222';
    it('존재하지 않는 message의 수정을 시도할 때 status code 404를 보낸다.', (done) => {
      agent2
        .post('/message/update/6/room/1')
        .set('Content-Type', 'application/json')
        .send({ content })
        .expect(404)
        .end(done);
    });

    it('다른 user의 message 수정을 시도할 때 status code 403를 보낸다.', (done) => {
      agent2
        .post('/message/update/3/room/1')
        .set('Content-Type', 'application/json')
        .send({ content })
        .expect(403)
        .end(done);
    });
  });
});

describe('DELETE /message/:mid/room/:rid는', () => {
  before(() => sequelize.sync({ force: true }));
  // mocking socket communication
  let io;
  before(() => {
    io = sinon.stub(app, 'get');
    io.withArgs('io').returns({
      of: sinon.stub().returnsThis(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub().returns(),
    });
    app.get.callThrough();
  });
  after(() => io.restore());
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
  // login with user 0 and send friend requests to user 1 and 2
  const agent1 = request.agent(app);
  before((done) => {
    agent1
      .post('/auth/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .end(() => {
        agent1.post('/friend/add/2').end(() => {
          agent1.post('/friend/add/3').end(done);
        });
      });
  });
  // login with user 1 and accept the friend request
  const agent2 = request.agent(app);
  before((done) => {
    agent2
      .post('/auth/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password })
      .end(() => {
        agent2.post('/friend/accept/1').end(done);
      });
  });
  // login with user 2 and accept the friend request
  const agent3 = request.agent(app);
  before((done) => {
    agent3
      .post('/auth/login')
      .type('form')
      .send({ email: users[2].email, password: users[2].password })
      .end(() => {
        agent3.post('/friend/accept/1').end(done);
      });
  });
  // post three messages
  before((done) => {
    agent1
      .post(`/message/room/${messages[0].roomId}`)
      .set('Content-Type', 'application/json')
      .send({ content: messages[0].content })
      .end(() => {
        agent2
          .post(`/message/room/${messages[1].roomId}`)
          .set('Content-Type', 'application/json')
          .send({ content: messages[1].content })
          .end(() => {
            agent3
              .post(`/message/room/${messages[2].roomId}`)
              .set('Content-Type', 'application/json')
              .send({ content: messages[2].content })
              .end(done);
          });
      });
  });

  describe('성공시', () => {
    it('status code 200을 보낸다.', (done) => {
      agent2.delete('/message/4/room/1').expect(200).end(done);
    });

    it('해당 message가 더이상 존재하지 않는다.', async () => {
      const messageResult = await Message.findOne({ where: { userId: 2 } });
      // console.log('messageResult: ', messageResult);
      should.not.exist(messageResult);
    });
  });

  describe('실패시', () => {
    it('존재하지 않는 message를 삭제하고자 할 때 status code 404을 보낸다.', (done) => {
      agent2.delete('/message/4/room/1').expect(404).end(done);
    });

    it('다른 유저의 message를 삭제하고자 할 때 status code 403을 보낸다.', (done) => {
      agent2.delete('/message/3/room/1').expect(403).end(done);
    });
  });
});
