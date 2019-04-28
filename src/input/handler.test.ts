import { assert, should, test } from '@gs-testing/main';
import { InstanceofType } from '@gs-types';
import { of as observableOf } from '@rxjs';
import { map } from '@rxjs/operators';
import { element } from '../main/element';
import { caller, CallerOutput } from '../output/caller';
import { handler, HandlerInput } from './handler';

test('input.handler', () => {
  const FUNCTION_NAME = 'testFn';
  const ELEMENT_ID = 'test';
  let input: HandlerInput<[number]>;
  let output: CallerOutput<[number]>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      caller: caller<[number]>(FUNCTION_NAME),
      handler: handler<[number]>(FUNCTION_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.handler;
    output = $._.caller;
  });

  test('getValue', () => {
    should(`creates a function that emits values`, async () => {
      const value = 123;

      const subject = input.getValue(shadowRoot).pipe(map(([v]) => v));

      output.output(shadowRoot, observableOf([value] as [number])).subscribe();
      await assert(subject).to.emitWith(value);
    });
  });
});
