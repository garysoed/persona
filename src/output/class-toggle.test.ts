import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';
import { Subject } from 'rxjs';
import { element } from '../main/element';
import { classToggle, ClassToggleOutput } from './class-toggle';

test('persona.output.classToggle', () => {
  const ELEMENT_ID = 'test';
  const CLASSNAME = 'classname';
  let output: ClassToggleOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
      classname: classToggle(CLASSNAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.classname;
  });

  test('output', () => {
    should(`update the attribute correctly`, () => {
      const valueSubject = new Subject<boolean>();

      output.output(shadowRoot, valueSubject).subscribe();
      valueSubject.next(true);
      assert(el.classList.contains(CLASSNAME)).to.beTrue();

      valueSubject.next(false);
      assert(el.classList.contains(CLASSNAME)).to.beFalse();
    });
  });
});
