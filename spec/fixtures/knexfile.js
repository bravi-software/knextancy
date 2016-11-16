import url from 'url';

const client = process.env.DB_CLIENT;

function getEnv(type) {
  const name = client.toUpperCase();
  return process.env[`${name}_${type}`] || process.env[`${name}_ENV_${name}_${type}`];
}

const address = url.parse(process.env.DB_PORT || getEnv('PORT'));


export default {
  test: {
    client: client === 'postgres' ? 'pg' : client,
    connection: {
      multipleStatements: true,
      host: address.hostname,
      port: address.port,
      user: process.env.DB_USER || getEnv('USER'),
      password: process.env.DB_PASSWORD || getEnv('PASSWORD'),
      database: process.env.DB_DATABASE || getEnv('DB') || getEnv('DATABASE'),
    },
    migrations: {
      directory: './spec/fixtures/db/migrations',
    },
    seeds: {
      directory: './spec/fixtures/db/seeds',
    },
  },

};
