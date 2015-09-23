import url from 'url';


export default {
  test: {
    client: 'mysql',
    connection: {
      multipleStatements: true,
      host: url.parse(process.env.DB_PORT).hostname,
      port: url.parse(process.env.DB_PORT).port,
      user: process.env.DB_USER || process.env.DB_ENV_MYSQL_USER,
      password: process.env.DB_PASSWORD || process.env.DB_ENV_MYSQL_PASSWORD,
      database: process.env.DB_DATABASE || process.env.DB_ENV_MYSQL_DATABASE,
    },
    migrations: {
      directory: './spec/fixtures/db/migrations',
    },
    seeds: {
      directory: './spec/fixtures/db/seeds',
    },
  },

};
