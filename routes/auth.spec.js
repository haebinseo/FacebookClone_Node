const should = require('should');
const request = require('supertest');
const app = require('../app');
const sequelize = require('../models');
const { User } = require('../models');

describe('GET /는', () => {
  const users = [
    { email: 'shb0107@gmail.com' },
    { name: '서해빈' },
    { password: 'goqls008?' },
    { gender: 'mail' },
    { birth: new Date(1994, 3, 7) },
  ];
  before(() => sequelize.sync({ force: true }));
  before(() => User.bulkCreate(users));

  describe('로그인 되어있을 시', () => {
    it('홈페이지를 렌더링해 반환함');
  });
});
