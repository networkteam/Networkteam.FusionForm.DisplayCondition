import {JSDOM} from 'jsdom';
import chai from 'chai';
import chaiDom from 'chai-dom';

import displayConditionInitializer from './displayConditionInitializer';

chai.use(chaiDom);
const {expect} = chai;

describe('Display Conditions', function() {
  let formEl, onlyLastnameCheckbox;

  beforeEach(function() {
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <head></head>
      <body>
        <form id="my-form" class="dynamic-form">

          <fieldset id="custom-validation-group">
            <legend>My section</legend>

            <input type="checkbox" id="only-lastname-checkbox" name="--my-form[onlyLastname]" />

            <div id="firstname-group" data-display-condition="!onlyLastname">
              <input type="text" id="firstname-input" name="--my-form[firstname]" value="" required />
            </div>

            <div id="lastname-group" data-display-condition="onlyLastname">
              <input type="text" id="lastname-input" name="--my-form[lastname]" value="" required />
            </div>
          </fieldset>

          <div id="salutation-radio-field" data-display-condition="onlyLastname">
            <input type="radio" id="salutation-mr-input" name="--my-form[salutation]" value="mr" required />
            <input type="radio" id="salutation-ms-input" name="--my-form[salutation]" value="ms" required />
            <input type="radio" id="salutation-empty-input" name="--my-form[salutation]" value="" disabled />
          </div>

          <button type="submit">Submit</button>
        </form>
      </body>
      </html>
    `);
    global.window = dom.window;
    global.CustomEvent = window.CustomEvent;
    global.document = window.document;

    formEl = document.getElementById('my-form');
    onlyLastnameCheckbox = document.getElementById('only-lastname-checkbox');
  });

  describe('applied to form', function() {
    let cleanup;

    beforeEach(function() {
        cleanup = displayConditionInitializer();
      });

    afterEach(function() {
      if (cleanup) {
        cleanup();
      }
    });

    it('should apply display conditions', function() {
      const firstnameGroupEl = formEl.querySelector('#firstname-group');
      const lastnameGroupEl = formEl.querySelector('#lastname-group');

      expect(firstnameGroupEl).not.to.have.class('js-hidden');
      expect(lastnameGroupEl).to.have.class('js-hidden');
    });

    it('should disable non displayed form elements', function() {
      const lastnameInput = formEl.querySelector('#lastname-input');

      expect(lastnameInput).to.have.attribute('disabled');
    });

    describe('when condition changed', function() {
      beforeEach(function() {
        onlyLastnameCheckbox.checked = true;
        onlyLastnameCheckbox.dispatchEvent(new window.Event('change', {bubbles: true}));
      });

      it('should enable displayed form elements', function() {
        const lastnameInput = formEl.querySelector('#lastname-input');

        expect(lastnameInput).not.to.have.attribute('disabled');
      });
    });

    describe('with reference to disabled element', function() {
      beforeEach(function() {
        onlyLastnameCheckbox.checked = true;
        onlyLastnameCheckbox.disabled = true;
        onlyLastnameCheckbox.dispatchEvent(new window.Event('change', {bubbles: true}));
      });

      it('should apply display condition', function() {
        const lastnameGroupEl = formEl.querySelector('#lastname-group');

        expect(lastnameGroupEl).not.to.have.class('js-hidden');
      });
    });

    describe('with explicitly disabled', function() {
      beforeEach(function() {
        onlyLastnameCheckbox.checked = true;
        onlyLastnameCheckbox.dispatchEvent(new window.Event('change', {bubbles: true}));
      });

      it('should leave disabled attribute', function() {
        const salutationEmptyInput = formEl.querySelector('#salutation-empty-input');

        expect(salutationEmptyInput).to.have.attribute('disabled');
      });
    });

    // TODO Test condition-hide and condition-show events with nested display conditions
  });
});
