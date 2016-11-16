// setup ES6 Proxy shim
require('harmony-reflect');
import knexSpecHelper from 'knex-spec-helper';

import knexConfig from './fixtures/knexfile';


export const knex = require('knex')(knexConfig.test);


beforeEach(async function () {
  this.knex = await knexSpecHelper.setup({
    knexConfig: knexConfig.test,
    knextancyEnabled: false,
    truncateEnabled: true,
  });
});


export default {
  knex: knex,
};
