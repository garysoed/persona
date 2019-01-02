import { assert, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { InstanceofType } from 'gs-types/export';
import { element } from './element';
import { subject, SubjectInput } from './subject';

test('input.subject', () => {
  const SUBJECT_NAME = 'testSubject';
  const ELEMENT_ID = 'test';
  let input: SubjectInput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      subject: subject<number>(SUBJECT_NAME),
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
      const testSubject = createSpySubject<number>();
      (el as any)[SUBJECT_NAME] = testSubject;

      assert(input.getValue(shadowRoot)).to.emitWith(testSubject);
    });
  });
});
