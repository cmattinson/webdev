import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  click,
  currentURL,
  visit
} from '@ember/test-helpers';

module('Acceptance | list teams', function(hooks) {
  setupApplicationTest(hooks);

  test('should show teams as the home page', async function (assert) {
    await visit('/');
    assert.equal(currentURL(), '/teams', 'should redirect automatically');
  });

  test('should link to information about the players', async function(assert) {
    await visit('/');
    await click(".menu-players");
    assert.equal(currentURL(), '/players', 'should navigate to players');
  });

  test('should link to information about the coaches', async function(assert) {
    await visit('/');
    await click(".menu-coaches");
    assert.equal(currentURL(), '/coaches', 'should navigate to coaches');
  });

  test('should list playoff teams.', async function(assert) {
    await visit('/');
    assert.equal(this.element.querySelectorAll('.team').length, 6, 'should display 6 teams');
  });
});
