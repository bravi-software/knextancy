import sinon from 'sinon';
import { expect } from 'chai';
import { knex } from './spec-helper';

import knextancy from '../src';
import setupAllTenants from '../src/setup-all-tenants';


describe('setup all tenants', function() {
  let stubSetup;

  describe('given some data in tenant 01 and tenant 02', function() {
    beforeEach(function() {
      stubSetup = sinon.stub().returns(Promise.resolve());

      return knextancy.tenant(knex, '01').then(function (tenantKnex) {
        return tenantKnex('$_users').insert({ name: 'Paulo' });
      }).then(function () {
        return knextancy.tenant(knex, '02').then(function (tenantKnex) {
          return tenantKnex('$_users').insert({ name: 'Pedro' });
        });
      });
    });

    it('should setup all tenants at once', async function (done) {
      try {
        await setupAllTenants(stubSetup, knextancy.fetchTenants)(knex);

        expect(stubSetup.callCount).to.least(2);

        const expectCallWith = function (tenant) {
          const args = stubSetup.args.filter((item) => item[1] === tenant)[0];
          expect(args[0]).to.have.property('__knex__');
          expect(args[1]).to.eql(tenant);
        };

        expectCallWith('01');
        expectCallWith('02');

        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
