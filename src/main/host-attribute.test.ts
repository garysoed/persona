import {assert, createSpySubject, should, test} from 'gs-testing';
import {Subject} from 'rxjs';

import {integerParser} from '../../src-next/util/parsers';
import {AttributeChangedEvent} from '../core/shadow-context';
import {createFakeContext} from '../testing/create-fake-context';

import {HostAttribute} from './host-attribute';

test('@persona/main/host-attribute', init => {
  const ATTR_NAME = 'attr';
  const DEFAULT_VALUE = 123;

  const _ = init(() => {
    const input = new HostAttribute(ATTR_NAME, integerParser(), DEFAULT_VALUE);
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const onAttributeChanged$ = new Subject<AttributeChangedEvent>();

    return {el, input, context: createFakeContext({shadowRoot, onAttributeChanged$})};
  });

  test('getValue', _, init => {
    const INIT_VALUE = 12;

    const _ = init(_ => {
      _.el.setAttribute(ATTR_NAME, `${INIT_VALUE}`);
      return _;
    });

    should('emit correctly parsed attributes', () => {
      const newValue = 34;

      const value$ = createSpySubject(_.input.getValue(_.context));
      _.el.setAttribute(ATTR_NAME, `${newValue}`);

      _.context.onAttributeChanged$.next({
        attrName: ATTR_NAME,
      });
      assert(value$).to.emitSequence([INIT_VALUE, newValue]);
    });

    should('emit the default value if parse failed', () => {
      const value$ = createSpySubject(_.input.getValue(_.context));
      _.el.setAttribute(ATTR_NAME, 'invalid');

      _.context.onAttributeChanged$.next({
        attrName: ATTR_NAME,
      });
      assert(value$).to.emitSequence([INIT_VALUE, DEFAULT_VALUE]);
    });

    should('start by emitting the current attribute value', () => {
      const value$ = createSpySubject(_.input.getValue(_.context));

      assert(value$).to.emitSequence([INIT_VALUE]);
    });

    should('not emit if attribute name doesn\'t match', () => {
      const value$ = createSpySubject(_.input.getValue(_.context));
      _.el.setAttribute(ATTR_NAME, '12');

      _.context.onAttributeChanged$.next({
        attrName: 'other',
      });

      assert(value$).to.emitSequence([INIT_VALUE]);
    });
  });
});
