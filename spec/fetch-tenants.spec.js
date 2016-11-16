import { knex } from './spec-helper';
import { expect } from 'chai';
import knextancy from '../src';


describe('fetch tenants', function() {
  describe('given some data in tenant 01 and tenant 02', function() {
    beforeEach(function() {
      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_users').insert({ name: 'Paulo' });
      }).then(function () {
        return knextancy.tenant(knex, '02').then(function (tenantKnex) {
          return tenantKnex('$_users').insert({ name: 'Pedro' });
        });
      });
    });

    it('should fetch all tenants available', async function (done) {
      try {
        const tenants = await knextancy.fetchTenants(knex);

        expect(tenants).to.have.length.least(2);
        expect(tenants).to.include.members(['01', '02']);

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
