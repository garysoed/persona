import { assert, createSpySubject, runEnvironment, should, test } from 'gs-testing';

import { PersonaTesterEnvironment } from '../testing/persona-tester-environment';

import { attributeObservable } from './attribute-observable';


test('@persona/util/attribute-observable', init => {
  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  should(`emit the attribute values correctly`, async () => {
    const attrName = 'attr-name';
    const el = document.createElement('div');

    const element$ = createSpySubject<string>(attributeObservable(el, attrName));

    el.setAttribute(attrName, 'a');
    el.setAttribute(attrName, 'a');
    el.setAttribute(attrName, 'b');

    assert(element$).to.emitSequence(['', 'a', 'b']);
  });
});
