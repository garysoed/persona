import { assert, retryUntil, should, test } from 'gs-testing/export/main';
import { integerConverter } from 'gs-tools/export/serializer';
import { InstanceofType, NumberType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { BehaviorSubject } from 'rxjs';
import { attributeIn, ResolvedAttributeInLocator } from './attribute-in-locator';
import { element } from './element-locator';

test('locator.AttributeLocator', () => {
  const ATTR_NAME = 'attr';
  const DEFAULT_VALUE = 123;
  const elementLocator = element('div', InstanceofType(HTMLElement));
  let locator: ResolvedAttributeInLocator<number>;

  beforeEach(() => {
    locator = attributeIn(
        elementLocator,
        ATTR_NAME,
        compose(integerConverter(), human()),
        NumberType,
        DEFAULT_VALUE,
    );
  });

  test('getObservableValue', () => {
    should(`create observable that emits attribute values`, async () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const innerEl = document.createElement('div');
      innerEl.setAttribute(ATTR_NAME, '456');
      shadowRoot.innerHTML = innerEl.outerHTML;

      const attrSubject = new BehaviorSubject<number|null>(null);
      locator.getObservableValue(shadowRoot).subscribe(attrSubject);

      assert(attrSubject.getValue()).to.equal(456);

      // Grab the element.
      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      watchedEl.setAttribute(ATTR_NAME, '789');

      await retryUntil(() => attrSubject.getValue()).to.equal(789);
    });

    should(
        `create observable that returns the default value if the element's attribute is missing`,
        () => {
          const root = document.createElement('div');
          const shadowRoot = root.attachShadow({mode: 'open'});

          const innerEl = document.createElement('div');
          shadowRoot.innerHTML = innerEl.outerHTML;

          const attrSubject = new BehaviorSubject<number|null>(null);
          locator.getObservableValue(shadowRoot).subscribe(attrSubject);

          assert(attrSubject.getValue()).to.equal(DEFAULT_VALUE);
        });
  });

  test('getValue', () => {
    should(`return the correct value`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const value = 456;
      const el = document.createElement('div');
      el.setAttribute(ATTR_NAME, `${value}`);
      shadowRoot.appendChild(el);

      assert(locator.getValue(shadowRoot)).to.equal(value);
    });

    should(`return the default value if the value type is not correct`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const el = document.createElement('div');
      el.setAttribute(ATTR_NAME, 'abc');
      shadowRoot.appendChild(el);

      assert(locator.getValue(shadowRoot)).to.equal(DEFAULT_VALUE);
    });
  });
});
