require('should-http');
const request = require('supertest');
// const io = require('socket.io-client');
// const http = require('http');
// const httpMocks = require('node-mocks-http');
// const events = require('events');
const sinon = require('sinon');
const { app } = require('../../app');
const { sequelize, User, Friend, Room, Message, Alarm } = require('../../db/models');

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
const wrongUser = {
  email: 'shb0107@gmail.com',
  family_name: '이메일',
  first_name: '중복',
  password: 'testpwd2',
  gender: 'male',
  year: 1994,
  month: '4월',
  day: 7,
};

let stub;
// let socket;
// const req = httpMocks.createRequest({
//   method: 'POST',
//   url: '/join',
//   body: users[0],
// });
// const res = httpMocks.createResponse({
//   eventEmitter: events.EventEmitter,
// });

/* ===================================  AUTHENTICATION  =================================== */
describe('POST /user/join은', () => {
  before(() => sequelize.sync({ force: true }));

  describe('공통', () => {
    it('기본 경로(/)로 redirect한다.', (done) => {
      request(app)
        .post('/user/join')
        .type('form')
        .send(users[0])
        .expect(303)
        .expect('Location', '/')
        .end(done);
    });
  });

  describe('성공시', () => {
    it('회원 정보를 users 테이블에 저장한다.', async () => {
      const userResult = await User.findOne({ where: { email: users[0].email } });
      userResult.should.be.an.instanceOf(Object);
      console.log('userResult: ', userResult.dataValues);
    });
  });

  describe('실패시', () => {
    before((done) => {
      request(app).post('/user/join').type('form').send(wrongUser).end(done);
    });

    it('users 테이블에 실패한 회원 정보가 존재하지 않는다.', async () => {
      const numUsers = await User.count();
      numUsers.should.be.equal(1);
      console.log('numUsers: ', numUsers);
    });
  });
});

describe('POST /user/login은', () => {
  before(() => sequelize.sync({ force: true }));
  before((done) => {
    request(app).post('/user/join').type('form').send(users[0]).end(done);
  });

  it('기본 경로(/)로 redirect한다.', (done) => {
    request(app)
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password })
      .expect(303)
      .expect('Location', '/')
      .end(done);
  });
});

describe('GET /user/logout은', () => {
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
  });

  it('로그아웃 후 기본 경로(/) 로 redirect한다.', (done) => {
    agent.get('/user/logout').expect(302).expect('Location', '/').end(done);
  });
});

/* ===================================  FRIEND  =================================== */
describe('POST /user/friend/:userid은', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before(async () => {
    await request(app).post('/user/join').type('form').send(users[0]);
    await request(app).post('/user/join').type('form').send(users[1]);
    await request(app).post('/user/join').type('form').send(users[2]);
  });
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
  /*
  // Setup client socket.io
  beforeEach((done) => {
    socket = io.connect('http://localhost:8000/user', { forceNew: true, path: '/socket.io' });
    socket.on('connect', done);
  });
  // Cleanup client socket.io
  afterEach((done) => {
    if (socket.connected) {
      socket.disconnect();
    }
    done();
  });
  */

  describe('성공시', () => {
    const agent = request.agent(app);
    before(async () => {
      // login
      await agent
        .post('/user/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password });
    });

    it('status code 201을 보낸다.', (done) => {
      agent.post('/user/friend/2').expect(201).end(done);
    });

    it('accepted: false인 column을 가지는 record를 Friend 테이블에 추가한다.', async () => {
      const friendResult = await Friend.findOne({
        where: { followerId: 1, followingId: 2, accepted: false },
      });
      console.log('friendResult: ', friendResult.dataValues);
      friendResult.should.be.type('object');
    });

    it(`친구 추가한 사용자에게 친구 확인을 요청하는 내용의 record를 Alarm 테이블에 추가한 뒤,
    해당 사용자의 user 채널로 socket 통신을 보낸다.`, (done) => {
      setTimeout(async () => {
        const alarmResult = await Alarm.findOne({
          where: { senderId: 1, receiverId: 2, type: 'confirmFriend' },
        });
        console.log('alarmResult: ', alarmResult.dataValues);
        alarmResult.should.be.type('object');
        // socket 통신 event 체크 코드 추가 예정
        done();
      }, 200);
    });

    describe('기존에 상대로부터 친구 신청 받은 상태인 경우에는', () => {
      const agent2 = request.agent(app);
      before(async () => {
        // login
        await agent2
          .post('/user/login')
          .type('form')
          .send({ email: users[1].email, password: users[1].password });
        // confirm friend
        await agent2.post('/user/friend/1');
      });

      it(`accepted: true인 column을 가지는 record와 메시지 기능을 위한 chat room을
      생성하고, 상대가 생성한 관계의 accepted값을 true로 수정한다.`, async () => {
        // a confirming friend record
        const friendResult = await Friend.findOne({
          where: { followerId: 2, followingId: 1, accepted: true },
        });
        friendResult.should.be.type('object');
        console.log('friendResult: ', friendResult.dataValues);

        // the friend record requested
        const friendRequestedResult = await Friend.findOne({
          where: { followerId: 1, followingId: 2 },
        });
        friendRequestedResult.accepted.should.be.true();
        console.log('friendRequestedResult: ', friendRequestedResult.dataValues);
      });

      it(`상대가 보낸 친구 확인 요청 알림 record를 삭제하고 친구 확정 알림 record를 Alarm 테이블에 추가한 뒤,
      해당 사용자의 user 채널로 socket 통신을 보낸다.`, (done) => {
        setTimeout(async () => {
          // the alarm accepted
          const alarmResult = await Alarm.findOne({
            where: { senderId: 1, receiverId: 2, type: 'confirmFriend' },
          });
          (alarmResult === null).should.be.true();
          console.log('alarmResult: ', alarmResult);

          // an alarm sent
          const alarmResult2 = await Alarm.findOne({
            where: { senderId: 2, receiverId: 1, type: 'friendConfirmed' },
          });
          alarmResult2.should.be.type('object');
          console.log('alarmResult2: ', alarmResult2.dataValues);
          // socket 통신 event 체크 코드 추가 예정
          done();
        }, 200);
      });
    });
  });

  describe('실패시', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/user/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('해당 사용자가 존재하지 않을 시 status code 404(Not Found)를 보낸다.', (done) => {
      agent.post('/user/friend/999').expect(404).end(done);
    });

    it('이미 친구인 경우 status code 409(Conflict)를 보낸다', (done) => {
      agent.post('/user/friend/2').expect(409).end(done);
    });
  });
});

describe('DELETE /user/friend/:userid은', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  before(async () => {
    await request(app).post('/user/join').type('form').send(users[0]);
    await request(app).post('/user/join').type('form').send(users[1]);
    await request(app).post('/user/join').type('form').send(users[2]);
  });
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

  describe('성공시', () => {
    const agent = request.agent(app);
    before(async () => {
      // login
      await agent
        .post('/user/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password });
      // add friend
      await agent.post('/user/friend/2');
    });

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent.delete('/user/friend/2').expect(204).end(done);
    });

    describe('친구 추가 취소인 경우', () => {
      it('사용자가 생성한 Friend 테이블의 record와 Alarm 테이블의 친구 확인 record를 삭제한다.', async () => {
        // friend record
        const friendResult = await Friend.findOne({
          where: { followerId: 1, followingId: 2 },
        });
        (friendResult === null).should.be.true();

        // alarm record
        const alarmResult = await Alarm.findOne({
          where: { senderId: 1, receiverId: 2, type: 'confirmFriend' },
        });
        (alarmResult === null).should.be.true();
      });
    });

    describe('두 사용자가 친구인 경우', () => {
      before(async () => {
        // add friend
        await agent.post('/user/friend/2');

        const agent2 = request.agent(app);
        // login
        await agent2
          .post('/user/login')
          .type('form')
          .send({ email: users[1].email, password: users[1].password });
        // confirm friend
        await agent2.post('/user/friend/1');
      });

      it('status code 204(No Content)을 보낸다.', (done) => {
        agent.delete('/user/friend/2').expect(204).end(done);
      });

      it('두 사용자가 각각 생성한 Friend 테이블의 record들을 삭제한다.', async () => {
        // friend record
        let friendResult = await Friend.findOne({
          where: { followerId: 1, followingId: 2 },
        });
        (friendResult === null).should.be.true();

        // friend record in reverse
        friendResult = await Friend.findOne({
          where: { followerId: 2, followingId: 1 },
        });
        (friendResult === null).should.be.true();
      });
    });
  });

  describe('실패시', () => {
    const agent = request.agent(app);
    // login
    before((done) => {
      agent
        .post('/user/login')
        .type('form')
        .send({ email: users[0].email, password: users[0].password })
        .end(done);
    });

    it('해당 사용자가 존재하지 않을 시 status code 404(Not Found)를 보낸다.', (done) => {
      agent.delete('/user/friend/999').expect(404).end(done);
    });

    it('친구 신청도 한적 없고, 친구도 아닌 경우 status code 409(Conflict)를 보낸다', (done) => {
      agent.delete('/user/friend/3').expect(409).end(done);
    });
  });
});

describe('PATCH /user/info은', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
  const agent = request.agent(app);
  before(async () => {
    await agent.post('/user/join').type('form').send(users[0]);
    await agent
      .post('/user/login')
      .type('form')
      .send({ email: users[0].email, password: users[0].password });
  });

  describe('성공시', () => {
    // before(() => {});
    const infoToModify = {
      name: '고영희',
    };

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent
        .patch('/user/info')
        .set('Content-Type', 'application/json')
        .send(infoToModify)
        .expect(204)
        .end(done);
    });

    it('사용자의 정보가 수정되어 있어야 한다.', async () => {
      const userResult = await User.findOne({ where: { email: users[0].email } });
      userResult.name.should.be.equal(infoToModify.name);
    });
  });

  // describe('실패시', () => {
  //   it('다른 사용자의 사진을 프로필 사진으로 사용하려 할 때 status code 403(Forbidden)을 보낸다.', (done) => {
  //     agent
  //       .patch('/user/info')
  //       .set('Content-Type', 'application/json')
  //       .send(infoModified)
  //       .expect(403)
  //       .end(done);
  //   });

  //   it('프로필 사진으로 사용하고자 하는 사진이 존재하지 않을 때 status code 404(Not Found)를 보낸다.', (done) => {
  //     agent
  //       .patch('/user/info')
  //       .set('Content-Type', 'application/json')
  //       .send(infoModified)
  //       .expect(404)
  //       .end(done);
  //   });
  // });
});

describe('PATCH /user/alarms은', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
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
    // add friend
    await agent.post('/user/friend/2');
  });
  const alarmsRead = { unreadAlarmIds: [1] };
  const nonexistentAlarmsRead = { unreadAlarmIds: [999, 998, 997] };

  describe('성공시', () => {
    const agent2 = request.agent(app);
    before((done) => {
      agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent2
        .patch('/user/alarms')
        .set('Content-Type', 'application/json')
        .send(alarmsRead)
        .expect(204)
        .end(done);
    });

    it('모든 알림이 읽음 상태로 수정되어 있어야 한다.', async () => {
      const alarmResult = await Alarm.findOne({ where: { isRead: false } });
      (alarmResult === null).should.be.true();
    });
  });

  describe('실패시', () => {
    it('해당 알림이 존재하지 않을 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent
        .patch('/user/alarms')
        .set('Content-Type', 'application/json')
        .send(nonexistentAlarmsRead)
        .expect(404)
        .end(done);
    });
  });
});

describe('DELETE /user/alarms은', () => {
  before(() => sequelize.sync({ force: true }));
  // join users
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
    // add friend
    await agent.post('/user/friend/2');
  });
  const alarmsToDelete = {
    alarmIds: [1],
  };
  const nonexistentAlarms = {
    alarmIds: [999, 998, 997],
  };

  describe('성공시', () => {
    const agent2 = request.agent(app);
    before((done) => {
      agent2
        .post('/user/login')
        .type('form')
        .send({ email: users[1].email, password: users[1].password })
        .end(done);
    });

    it('status code 204(No Content)을 보낸다.', (done) => {
      agent2
        .delete('/user/alarms')
        .set('Content-Type', 'application/json')
        .send(alarmsToDelete)
        .expect(204)
        .end(done);
    });

    it('알림이 존재하지 않아야 한다.', async () => {
      const alarmResult = await Alarm.findOne({ where: { id: alarmsToDelete.alarmIds[0] } });
      (alarmResult === null).should.be.true();
    });
  });

  describe('실패시', () => {
    it('해당 알림이 존재하지 않을 때 status code 404(Not Found)를 보낸다.', (done) => {
      agent
        .delete('/user/alarms')
        .set('Content-Type', 'application/json')
        .send(nonexistentAlarms)
        .expect(404)
        .end(done);
    });
  });
});
