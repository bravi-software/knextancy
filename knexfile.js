// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      multipleStatements: true,
      host     : process.env.MYSQL_PORT_3306_TCP_ADDR,
      user     : process.env.MYSQL_ENV_MYSQL_USER,
      password : process.env.MYSQL_ENV_MYSQL_PASSWORD,
      database : process.env.MYSQL_ENV_MYSQL_DATABASE
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }

};
