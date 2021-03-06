import { schedule, scheduleOnce } from '@ember/runloop';
import { isPresent } from '@ember/utils';
import { on } from '@ember/object/evented';
import Mixin from '@ember/object/mixin';
import Ember from 'ember';
import Foundation from '../-private/foundation';

const {
  Logger: {
    warn
  }
} = Ember;

/**
 * Mixin that was shamelessly ripped off from the Ember jQuery UI folks (hey, why reinvent the
 * wheel). This makes it drop dead simple to convert between Zurb Foundation land and the land
 * of Ember filled with Chocolate rivers and gumdrop rainbows. And bacon. Lot's and lots of
 * bacon.
 */
export default Mixin.create({

  /**
   * Handle setup of this components' DOM element.
   */
  setup: on('didInsertElement', function() {
    this._setup();
  }),

  /**
   * Handle destruction of component.
   */
  shutdown: on('willDestroyElement', function() {
    let ui = this.get('zfUi');
    if (isPresent(ui)) {
      let observers = this._observers;

      // Nuke any observers that were created
      for (let opKey in observers) {
        if (observers.hasOwnProperty(opKey)) {
          this.removeObserver(opKey, observers[opKey]);
        }
      }
    }

    schedule('render', () => {
      // Finally destroy everything else.
      let zfUiList = this.get('zfUiList'),
        element = ui && ui.$element;

      for (let zfUi of zfUiList) {
        zfUi.destroy();
      }

      if(element && element.hasClass('reveal')) {
        element.remove();
      }
    });
  }),

  _setup: function() {
    // Perform any custom handling
    if (isPresent(this.handlePreRender)) {
      this.handlePreRender();
    }

    scheduleOnce('afterRender', () => {

      // Adapt the options
      let options = this._adaptOptions();

      // Instantiate widget. Some widgets have multiple controls so we handle this case by
      // creating an array of zfUi elements. The first element gets stuffed into the zfUi
      // member with the whole list getting stuffed into zfUiList. It's up to the control to
      // expose this as friendly properties to the user.
      let zfType = this.get('zfType');
      let controlIds = this.get('controlIds');
      let zfUiList = [];
      const isZfTypeLoaded = !!Foundation[zfType];

      if (isZfTypeLoaded) {
        if (isPresent(controlIds)) {
          for (let controlId of controlIds) {
            let ui = new Foundation[zfType](this.$(controlId), options);
            zfUiList.push(ui);
          }
        }

        if (0 === zfUiList.length) {
          let ui = new Foundation[zfType](this.$(), options);
          this.set('zfUi', ui);
          zfUiList.push(ui);
        }
        else {
          this.set('zfUi', zfUiList[0]);
        }

        this.set('zfUiList', zfUiList);
      } else {
        warn(`Foundation plugin ${zfType} has not been loaded, please check your ember-cli-foundation-6-sass configuration`);
      }

      // Perform any custom handling
      if (isPresent(this.handleInsert)) {
        this.handleInsert();
      }
    });
  },

  /**
   * Translate the options from the Ember way to foundation.
   * @return {Object}  An object containing our options.
   */
  _adaptOptions: function() {
    let fdnOptions = this.get('zfOptions') || [];
    let options = {};

    // We are going to be observing changes. Initialze our cached observer list
    this._observers = this._observers || {};

    let observer = function(sender, key) {
      // Update options dynamically. Right now this is an all or nothing for widgets with
      // multiple UI elements.
      let value = sender.get(key);
      let zfUiList = this.get('zfUiList');
      for (let zfUi of zfUiList) {
        zfUi.options[this._getZfOpKey(key)] = value;
      }

    };

    // Each component can specify a list of options that will be exposed to an external
    // consumer. Iterate through the options and build up the options object that gets returned
    for (var opKey of fdnOptions) {
      let zfOpKey = this._getZfOpKey(opKey);
      options[zfOpKey] = this.get(opKey);

      // We also want to observe any changes so observe each component and push any updates
      // to foundation.

      this.addObserver(opKey, observer);

      // Cache the obsever so we can be a well behaved compoent and unsubscribe later
      this._observers[opKey] = observer;
    }

    return options;
  },



  /**
   * Get a "Zurb Foundation" specific options key. In some cases, ZF overloads existing ember
   * component fields. We handle this by prefacing the options with "zf-". So layout (used by
   * Ember) becomes "zf-layout".
   * @param  {string} opKey Options key.
   * @return {string}       Zurb foundation specific options key.
   */
  _getZfOpKey(opKey) {
    let retVal = opKey;
    let zfPreamble = 'zf-';
    if (true === opKey.startsWith(zfPreamble)) {
      retVal = opKey.substring(zfPreamble.length);
    }

    return retVal;
  }
});
