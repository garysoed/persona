import { assert, should, test } from 'gs-testing/export/main';
import { integerConverter } from 'gs-tools/export/serializer';
import { Subject } from 'gs-tools/node_modules/rxjs';
import { InstanceofType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { element } from '../input/element';
import { attribute, AttributeOutput } from './attribute';

test('output.attribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let output: AttributeOutput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      attr: attribute(
          ATTR_NAME,
          compose(integerConverter(), human()),
          value => value % 2 === 0,
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