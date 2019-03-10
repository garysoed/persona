import { assert, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { of as observableOf } from 'rxjs';
import { element } from '../input/element';
import { caller, CallerOutput } from './caller';

test('input.caller', () => {
  const FUNCTION_NAME = 'testFn';
  const ELEMENT_ID = 'test';
  let output: CallerOutput<[number]>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      caller: caller<[number]>(FUNCTION_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.caller;
  });

  test('output', () => {
    should(`call the function specified`, async () => {
      const spySubject = createSpySubject();
      (el as any)[FUNCTION_NAME] = (v: number) => spySubject.next(v);

      const value = 123;
      output.output(shadowRoot, observableOf([value] as [number])).subscribe();

      await assert(spySubject).to.emitWith(value);
    });
  });
});
