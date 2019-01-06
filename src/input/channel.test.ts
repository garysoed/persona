import { assert, should, test } from 'gs-testing/export/main';
import { InstanceofType, NumberType } from 'gs-types/export';
import { BehaviorSubject } from 'rxjs';
import { channel, ChannelInput } from './channel';
import { element } from './element';

test('input.subject', () => {
  const SUBJECT_NAME = 'testSubject';
  const ELEMENT_ID = 'test';
  let input: ChannelInput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      subject: channel<number>(SUBJECT_NAME, NumberType),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.subject;
  });

  test('getValue', () => {
    should(`create observable that emits the dispatcher`, () => {
      const value = 123;
      const testSubject = new BehaviorSubject(value);
      (el as any)[SUBJECT_NAME] = testSubject;

      assert(input.getValue(shadowRoot)).to.emitWith(value);
    });
  });
});
