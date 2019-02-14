import { assert, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { InstanceofType, NumberType } from 'gs-types/export';
import { take } from 'rxjs/operators';
import { channelIn, ChannelInput } from './channel-in';
import { channelOut, ChannelOutput } from './channel-out';
import { element } from './element';

test('input.channelOut', () => {
  const SUBJECT_NAME = 'testSubject';
  const ELEMENT_ID = 'test';
  let input: ChannelInput<number>;
  let output: ChannelOutput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      channelIn: channelIn(SUBJECT_NAME, NumberType),
      channelOut: channelOut<number>(SUBJECT_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.channelIn;
    output = $._.channelOut;
  });

  test('getValue', () => {
    should(`return function that calls the channel in`, async () => {
      const value = 123;
      const spySubject = createSpySubject();
      input.getValue(shadowRoot).subscribe(spySubject);

      output.getValue(shadowRoot).pipe(take(1)).subscribe(fn => fn(value));

      await assert(spySubject).to.emitWith(value);
    });
  });
});
