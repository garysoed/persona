import { assert, should, test } from '@gs-testing';

import { SimpleElementRenderSpec } from './simple-element-render-spec';

test('@persona/render/simple-element-render-spec', () => {
  test('canReuseElement', () => {
    should(`return true if the tag names are the same`, () => {
      const el = document.createElement('div');
      const spec = new SimpleElementRenderSpec('div', new Map(), '');
      assert(spec.canReuseElement(el)).to.beTrue();
    });

    should(`return false if the tag names are different`, () => {
      const el = document.createElement('b');
      const spec = new SimpleElementRenderSpec('div', new Map(), '');
      assert(spec.canReuseElement(el)).to.beFalse();
    });
  });

  test('createElement', () => {
    should(`create the element correctly`, () => {
      const spec = new SimpleElementRenderSpec('div', new Map(), '');
      const el = spec.createElement();

      assert(el.tagName.toLowerCase()).to.equal('div');
    });
  });

  test('updateElement', () => {
    should(`update the attributes and inner text correctly`, () => {
      const spec = new SimpleElementRenderSpec(
          'div',
          new Map([['added', '123'], ['updated', '345']]),
          'innerText',
      );
      const el = spec.createElement();
      el.setAttribute('deleted', '567');
      el.setAttribute('updated', 'abc');
      spec.updateElement(el);

      assert(el.getAttribute('added')).to.equal('123');
      assert(el.getAttribute('updated')).to.equal('345');
      assert(el.hasAttribute('deleted')).to.beFalse();
    });
  });
});
