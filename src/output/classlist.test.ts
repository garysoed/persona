import { assert, should, test } from '@gs-testing';
import { InstanceofType } from '@gs-types';
import { Subject } from '@rxjs';

import { element } from '../main/element';

import { classlist, ClasslistOutput } from './classlist';


test('output.classlist', () => {
  const ELEMENT_ID = 'test';
  let output: ClasslistOutput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      classlist: classlist(),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    output = $._.classlist;
  });

  test('output', () => {
    should(`update the classes correctly`, () => {
      const valueSubject = new Subject<ReadonlySet<string>>();

      output.output(shadowRoot, valueSubject).subscribe();
      valueSubject.next(new Set(['a', 'b', 'c']));
      assert(el.getAttribute('class')).to.equal(`a b c`);
    });
  });
});
