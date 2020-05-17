import { assert, createSpySubject, run, should, teardown, test } from 'gs-testing';
import { instanceofType, numberType, tupleOfType } from 'gs-types';
import { of as observableOf, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { element } from '../main/element';
import { caller } from '../output/caller';
import { createFakeContext } from '../testing/create-fake-context';

import { handler } from './handler';


test('@persona/input/handler', init => {
  const FUNCTION_NAME = 'testFn';
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const onTestDone$ = new ReplaySubject(1);
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      caller: caller<[number]>(FUNCTION_NAME),
      handler: handler(FUNCTION_NAME),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.handler;
    const output = $._.caller;

    return {input, onTestDone$, output, context: createFakeContext({shadowRoot}), el};
  });

  teardown(() => {
    _.onTestDone$.next();
    _.onTestDone$.complete();
  });

  test('getValue', () => {
    should(`creates a function that emits values`, () => {
      const value = 123;

      const subject = createSpySubject(_.input.getValue(_.context).pipe(map(([v]) => v)));

      run(observableOf([value] as [number]).pipe(_.output.output(_.context)));
      assert(subject).to.emitWith(value);
    });
  });
});
