import { expect } from 'chai';
import knex from 'knex';

import knextancy from '../src';
import knexConfig from './fixtures/knexfile';

describe('migration queries', () => {
  describe('given a config without table name', () => {
    const config = knexConfig.test;

    it('should run the migrations per tenant', async () => {
      const baseKnex = await knex(config);
      await knextancy.tenant(baseKnex, '01');
      const migrations01 = await baseKnex('01_knex_migrations')
        .select();

      expect(migrations01).to.have.length(2);

      await knextancy.tenant(baseKnex, '02');
      const migrations02 = await baseKnex('02_knex_migrations')
        .select();

      expect(migrations02).to.have.length(2);
    });
  });

  describe('given a config with table name', () => {
    const config = {
      ...knexConfig.test,
    };
    config.migrations.tableName = 'knex_migrations';

    it('should run the migrations per tenant', async () => {
      const baseKnex = await knex(config);
      await knextancy.tenant(baseKnex, '101');
      const migrations01 = await baseKnex('101_knex_migrations')
        .select();

      expect(migrations01).to.have.length(2);

      await knextancy.tenant(baseKnex, '102');
      const migrations02 = await baseKnex('102_knex_migrations')
        .select();

      expect(migrations02).to.have.length(2);
    });
  });

  describe('given a config with a prefixed table name', () => {
    const config = {
      ...knexConfig.test,
    };
    config.migrations.tableName = '$_knex_migrations';

    it('should run the migrations per tenant', async () => {
      const baseKnex = await knex(config);
      await knextancy.tenant(baseKnex, '101');
      const migrations01 = await baseKnex('101_knex_migrations')
        .select();

      expect(migrations01).to.have.length(2);

      await knextancy.tenant(baseKnex, '102');
      const migrations02 = await baseKnex('102_knex_migrations')
        .select();

      expect(migrations02).to.have.length(2);
    });
  });
});
