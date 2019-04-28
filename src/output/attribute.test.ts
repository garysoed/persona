import { assert, setup, should, test } from '@gs-testing';
import { integerConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { human } from '@nabu/grammar';
import { compose } from '@nabu/util';
import { Subject } from '@rxjs';
import { element } from '../main/element';
import { attribute, AttributeOutput } from './attribute';

test('output.attribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let output: AttributeOutput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  setup(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      attr: attribute(
          ATTR_NAME,
          compose(integerConverter(), human()),
          234,
      ),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.attr;
  });

  test('output', () => {
    should(`update the attribute correctly`, () => {
      const valueSubject = new Subject<number>();

      output.output(shadowRoot, valueSubject).subscribe();
      valueSubject.next(123);
      assert(el.getAttribute(ATTR_NAME)).to.equal(`123`);

      valueSubject.next(234);
      assert(el.hasAttribute(ATTR_NAME)).to.beFalse();
    });
  });
});
