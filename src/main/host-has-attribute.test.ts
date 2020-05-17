import { assert, createSpySubject, should, test } from 'gs-testing';
import { Subject } from 'rxjs';

import { AttributeChangedEvent } from '../core/persona-context';
import { createFakeContext } from '../testing/create-fake-context';

import { HostHasAttribute } from './host-has-attribute';


test('@persona/main/host-has-attribute', init => {
  const ATTR_NAME = 'attr';

  const _ = init(() => {
    const input = new HostHasAttribute(ATTR_NAME);
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const onAttributeChanged$ = new Subject<AttributeChangedEvent>();

    return {el, input, context: createFakeContext({shadowRoot, onAttributeChanged$})};
  });

  test('getValue', () => {
    should(`emit correct values`, () => {
      const value$ = createSpySubject(_.input.getValue(_.context));
      _.el.setAttribute(ATTR_NAME, '34');

      _.context.onAttributeChanged$.next({
        attrName: ATTR_NAME,
        oldValue: ``,
        newValue: `34`,
      });
      assert(value$).to.emitSequence([false, true]);
    });

    should(`not emit if attribute name doesn't match`, () => {
      const value$ = createSpySubject(_.input.getValue(_.context));

      _.context.onAttributeChanged$.next({
        attrName: 'other',
        oldValue: ``,
        newValue: `34`,
      });

      assert(value$).to.emitSequence([false]);
    });
  });
});
