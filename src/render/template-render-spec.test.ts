import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { identity } from 'nabu';

import { element } from '../main/element';
import { attribute } from '../output/attribute';

import { renderFromTemplate } from './template-render-spec';

test('@persona/render/template-render-spec', () => {
  test('createElement', () => {
    should(`create the element correcty`, () => {
      const templateEl = document.createElement('template');
      templateEl.innerHTML = '<div></div>';

      const spec = renderFromTemplate(templateEl).build();
      const el = spec.createElement();
      assert(el.tagName.toLowerCase()).to.equal('div');
    });

    should(`throw if the template has multiple root elements`, () => {
      const templateEl = document.createElement('template');
      templateEl.innerHTML = '<div></div><div></div>';

      const spec = renderFromTemplate(templateEl).build();
      assert(() => spec.createElement()).to.throwErrorWithMessage(/expected 1/);
    });

    should(`throw if the template is empty`, () => {
      const templateEl = document.createElement('template');

      const spec = renderFromTemplate(templateEl).build();
      assert(() => spec.createElement()).to.throwErrorWithMessage(/expected 1/);
    });
  });

  test('updateElement', () => {
    should(`update the element correctly`, () => {
      const templateEl = document.createElement('template');
      templateEl.innerHTML = '<div><div id="root"></div></div>';

      const $ = {
        root: element('root', instanceofType(HTMLDivElement), {
          attr: attribute('attr', identity()),
        }),
      };

      const spec = renderFromTemplate(templateEl)
          .addOutput($.root._.attr, 'abc')
          .build();

      const el = spec.createElement();
      const rootEl = el.querySelector('#root')!;

      spec.updateElement(el);
      assert(rootEl.getAttribute($.root._.attr.attrName)).to.equal('abc');
    });
  });
});
