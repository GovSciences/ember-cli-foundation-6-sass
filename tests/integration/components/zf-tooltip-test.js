import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | zf tooltip', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

    await render(hbs`{{zf-tooltip}}`);

    assert.equal(find('*').textContent.trim(), '');

    // Template block usage:" + EOL +
    await render(hbs`
      {{#zf-tooltip}}
        template block text
      {{/zf-tooltip}}
    `);

    assert.equal(find('*').textContent.trim(), 'template block text');

  });
});
