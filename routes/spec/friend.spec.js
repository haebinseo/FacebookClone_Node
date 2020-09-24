require('should-http');
const request = require('supertest');
const sinon = require('sinon');
const { app } = require('../../app');
const { sequelize, Friend, Room, Message } = require('../../db/models');

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

describe('POST /friend/add/:uid는', () => {
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

  describe('성공시', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('status code 200을 보낸다.', (done) => {
      agent.post('/friend/add/2').expect(200).end(done);
    });

    it('followerId: 1, followingId: 2, accepted: false인 record를 Friend 테이블에 추가한다.', async () => {
      const friendResult = await Friend.findOne({
        where: { followerId: 1, followingId: 2, accepted: false },
      });
      console.log('friendResult: ', friendResult.dataValues);
      friendResult.should.be.type('object');
    });
  });
});

describe('POST /friend/accept/:uid는', () => {
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

  describe('성공시', () => {
    // add a friend (POST /friend/add/2)
    const agent = request.agent(app);
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(() => {
          agent
            .post('/friend/add/2')

            .end(() => {
              agent.get('/auth/logout').end(done);
            });
        });
    });
    // login
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('status code 200을 보낸다.', (done) => {
      agent.post('/friend/accept/1').expect(200).end(done);
    });

    let friendsResult;
    it('Friend table에 두 사용자의 친구 관계가 저장되어야 한다.', async () => {
      friendsResult = await Friend.findAll();
      friendsResult.forEach((fr, idx) => console.log(`friend ${idx}: `, fr.dataValues));
      friendsResult.should.have.length(2);
      friendsResult[0].accepted.should.be.ok();
      friendsResult[1].accepted.should.be.ok();
    });

    let roomResult;
    it('두 사용자의 friend record에 새로운 chatting roomId가 할당되어 있어야한다.', async () => {
      const roomIds = friendsResult.map((fr) => fr.roomId);
      roomIds[0].should.be.equal(roomIds[1]);
      console.log(`user1's roomId: ${roomIds[0]}, user2's roomId: ${roomIds[1]}`);

      roomResult = await Room.findOne({ where: { id: roomIds[0] } });
      roomResult.should.be.type('object');
      console.log('room: ', roomResult.dataValues);
    });

    it('친구와 메시지 보내기가 가능함을 알리는 시스템 메시지가 작성된다.', async () => {
      const messageResult = await Message.findOne({ where: { roomId: roomResult.id } });
      messageResult.should.be.type('object');
      console.log('messagesResult: ', messageResult.dataValues);
    });
  });

  describe('기존 친구 요청 없이 수락 요청을 받을 시', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('status code 404 보낸다.', (done) => {
      agent.post('/friend/accept/2').expect(404).end(done);
    });
  });
});

describe('DELETE /friend/remove/:uid는', () => {
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

  describe('성공시', () => {
    // add a friend (POST /friend/add/2)
    const agent = request.agent(app);
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(() => {
          agent
            .post('/friend/add/2')

            .end(() => {
              agent.get('/auth/logout').end(done);
            });
        });
    });
    // login (GET /auth/login) and accept a friend request (POST /friend/accept/1)
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(() => {
          agent.post('/friend/accept/1').end(done);
        });
    });

    it('status code 200을 보낸다.', (done) => {
      agent.delete('/friend/remove/1').expect(200).end(done);
    });

    it('friends table에 두 사용자의 친구 관계가 존재하지 않아야 한다.', async () => {
      const friendsResult = await Friend.findAll();
      friendsResult.should.be.empty();
      console.log('friendsResult: ', friendsResult);
    });

    it('rooms table에 두 사용자의 chatting room이 존재하지 않아야 한다.', async () => {
      const roomsResult = await Room.findAll();
      roomsResult.should.be.empty();
      console.log('roomsResult: ', roomsResult);
    });

    it('두 사용자 간의 메시지가 존재하지 않아야 한다.', async () => {
      const messagesResult = await Message.findAll();
      messagesResult.should.be.empty();
      console.log('messagesResult: ', messagesResult);
    });
  });

  describe('친구가 아닌 상태에서 끊기 요청을 받을 시', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/auth/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('status code 404을 보낸다.', (done) => {
      agent.post('/friend/remove/1').expect(404).end(done);
    });
  });
});
