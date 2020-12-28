const should = require('should');
require('should-http');
const request = require('supertest');
const sinon = require('sinon');
const { app } = require('../../app');
const { sequelize, Message, Sequelize } = require('../../db/models');

const users = [
  {
    email: 'shb0107@gmail.com',
    family_name: '서',
    first_name: '해빈',
    password: 'testpwd',
    gender: 'male',
    year: 1994,
    month: '4월',
    day: 7,
  },
  {
    email: 'peh1@gmail.com',
    family_name: '박',
    first_name: '은희',
    password: 'testpwd2',
    gender: 'female',
    year: 1998,
    month: '9월',
    day: 12,
  },
  {
    email: 'jyy@gmail.com',
    family_name: '유',
    first_name: '정엽',
    password: 'testpwd3',
    gender: 'male',
    year: 1994,
    month: '1월',
    day: 3,
  },
];
const messages = [
  { content: '테스트 메시지입니다!', roomId: 1, senderId: 1 },
  { content: '테스트 메시지입니다!!2', roomId: 1, senderId: 2 },
  { content: '테스트 메시지입니다!!!3', roomId: 2, senderId: 3 },
];
let stub;

describe('POST /message/room/:roomId', () => {
  before(() => sequelize.sync({ force: true }));
  // mocking socket communication
  before(() => {
    stub = sinon.stub(app, 'get');
    stub.withArgs('io').returns({
      of: sinon.stub().returnsThis(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub().returns(),
    });
    app.get.callThrough();
  });
  after(() => {
    stub.restore();
  });

  const agent = request.agent(app);
  const agent2 = request.agent(app);
  const agent3 = request.agent(app);
  before(async () => {
    // join users
    await agent.post('/user/join').type('form').send(users[0]);
    await agent.post('/user/join').type('form').send(users[1]);
    await agent.post('/user/join').type('form').send(users[2]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    await agent2
      .post('/user/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password });
    await agent3
      .post('/user/login')
      .type('form')
      .send({ email: users[2].email, password: users[2].password });
    // add friends
    await agent.post('/user/friend/2');
    await agent.post('/user/friend/3');
    // confirm friend requests
    await agent2.post('/user/friend/1');
    await agent3.post('/user/friend/1');
  });

  describe('성공시', () => {
    it('status code 201(Created)을 보낸다.', async () => {
      // post three messages
      await agent
        .post(`/message/room/${messages[0].roomId}`)
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(201);
      await agent2
        .post(`/message/room/${messages[1].roomId}`)
        .set('Content-Type', 'application/json')
        .send({ content: messages[1].content })
        .expect(201);
      await agent3
        .post(`/message/room/${messages[2].roomId}`)
        .set('Content-Type', 'application/json')
        .send({ content: messages[2].content })
        .expect(201);
    });

    it('해당 senderId, roomId를 가지는 message record를 생성한다.', async () => {
      const messagesResult = await Message.findAll({
        where: {
          senderId: { [Sequelize.Op.ne]: null },
        },
      });
      should.exist(messagesResult);
      messagesResult.should.have.length(3);
      messagesResult.forEach((message, idx) => {
        // console.log(`messages[${idx}]: `, message.dataValues);
        message.senderId.should.be.equal(messages[idx].senderId);
        message.roomId.should.be.equal(messages[idx].roomId);
        message.content.should.be.equal(messages[idx].content);
      });
    });
  });

  describe('실패시', () => {
    it('user가 소속되지 않은 chatting room에 message를 작성할 때 status code 403(Forbidden)을 보낸다.', (done) => {
      agent2
        .post('/message/room/2')
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(403)
        .end(done);
    });

    it('존재하지 않는 chatting room에 message를 작성할 때 status code 404를 보낸다.', (done) => {
      agent2
        .post('/message/room/999')
        .set('Content-Type', 'application/json')
        .send({ content: messages[0].content })
        .expect(404)
        .end(done);
    });
  });
});

describe('DELETE /message/:messageId/room/:roomId는', () => {
  before(() => sequelize.sync({ force: true }));
  // mocking socket communication
  before(() => {
    stub = sinon.stub(app, 'get');
    stub.withArgs('io').returns({
      of: sinon.stub().returnsThis(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub().returns(),
    });
    app.get.callThrough();
  });
  after(() => stub.restore());

  const agent = request.agent(app);
  const agent2 = request.agent(app);
  const agent3 = request.agent(app);
  before(async () => {
    // join users
    await agent.post('/user/join').type('form').send(users[0]);
    await agent.post('/user/join').type('form').send(users[1]);
    await agent.post('/user/join').type('form').send(users[2]);
    // login
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
    await agent2
      .post('/user/login')
      .type('form')
      .send({ email: users[1].email, password: users[1].password });
    await agent3
      .post('/user/login')
      .type('form')
      .send({ email: users[2].email, password: users[2].password });
    // add friends
    await agent.post('/user/friend/2');
    await agent.post('/user/friend/3');
    // confirm friend requests
    await agent2.post('/user/friend/1');
    await agent3.post('/user/friend/1');
    // post three messages
    await agent
      .post(`/message/room/${messages[0].roomId}`)
      .set('Content-Type', 'application/json')
      .send({ content: messages[0].content });
    await agent2
      .post(`/message/room/${messages[1].roomId}`)
      .set('Content-Type', 'application/json')
      .send({ content: messages[1].content });
    await agent3
      .post(`/message/room/${messages[2].roomId}`)
      .set('Content-Type', 'application/json')
      .send({ content: messages[2].content });
  });

  describe('성공시', () => {
    let message;
    it('status code 204(No Content)를 보낸다.', async () => {
      message = await Message.findOne({
        where: {
          senderId: messages[0].senderId,
          roomId: messages[0].roomId,
        },
      });

      await agent.delete(`/message/${message.id}/room/${message.roomId}`).expect(204);
    });

    it('해당 message record가 messages 테이블에 더이상 존재하지 않는다.', async () => {
      const messageResult = await Message.findOne({ where: { id: message.id } });
      // console.log('messageResult: ', messageResult);
      should.not.exist(messageResult);
    });
  });

  describe('실패시', () => {
    let message;
    it('다른 유저의 message를 삭제하고자 할 때 status code 403을 보낸다.', async () => {
      message = await Message.findOne({
        where: {
          senderId: messages[1].senderId,
          roomId: messages[1].roomId,
        },
      });

      await agent.delete(`/message/${message.id}/room/${message.roomId}`).expect(403);
    });

    it('존재하지 않는 message를 삭제하고자 할 때 status code 404을 보낸다.', async () => {
      await agent.delete(`/message/999/room/${message.roomId}`).expect(404);
      await agent2.delete(`/message/${message.id}/room/999`).expect(404);
    });
  });
});
