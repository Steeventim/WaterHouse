const { DataSource } = require('typeorm');
const {
  User,
} = require('../dist/out-tsc/api/src/modules/auth/entities/user.entity.js');
const {
  OtpRequest,
} = require('../dist/out-tsc/api/src/modules/auth/entities/otp-request.entity.js');

const options = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'data/sqlite.db',
  entities: [User, OtpRequest],
  migrations: ['api/dist-migrations/*.js'],
};

const dataSource = new DataSource(options);

module.exports = dataSource;
