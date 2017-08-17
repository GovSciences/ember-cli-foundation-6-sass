import Ember from 'ember';
import zfWidget from 'ember-cli-foundation-6-sass/mixins/zf-widget';

export default Ember.Component.extend(zfWidget, {


  /** @member Attribute bindings */
  attributeBindings: ['data-equalizer'],

  /** @member Makes the data attribute binding appear */
  'data-equalizer': ' ',

  /** @member Foundation type */
  'zfType': 'Equalizer',

  update: Ember.on('didUpdate', function() {
    this._setup();
  }),

});
