import { Subject, fromEvent, of as observableOf } from 'rxjs';
import { assert, createSpy, createSpySubject, run, should, test } from 'gs-testing';
import { compose, human } from 'nabu';
import { instanceofType } from 'gs-types';
import { integerConverter } from 'gs-tools/export/serializer';
import { map } from 'rxjs/operators';

import { attribute as attributeIn } from '../input/attribute';
import { attribute as attributeOut } from '../output/attribute';
import { caller } from '../output/caller';
import { classToggle } from '../output/class-toggle';
import { createFakeContext } from '../testing/create-fake-context';
import { dispatcher } from '../output/dispatcher';
import { element } from '../selector/element';
import { handler } from '../input/handler';
import { hasAttribute } from '../input/has-attribute';
import { hasClass } from '../input/has-class';
import { onDom } from '../input/on-dom';
import { setAttribute } from '../output/set-attribute';

import { api } from './api';


test('@persona/main/api', init => {
  const ELEMENT_ID = 'test';
  const $ = {
    attrIn: attributeIn('attr-in', compose(integerConverter(), human()), 234),
    attrOut: attributeOut('attr-out', compose(integerConverter(), human()), 345),
    caller: caller('caller'),
    classToggle: classToggle('classToggle'),
    dispatcher: dispatcher('dispatch'),
    handler: handler('handler'),
    hasAttr: hasAttribute('has-attr'),
    hasClass: hasClass('hasClass'),
    onDom: onDom('ondom'),
    setAttr: setAttribute('set-attr'),
  };

  const _ = init(() => {
    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    return {context: createFakeContext({shadowRoot}), el};
  });

  should('handle attribute input correctly', () => {
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.attrIn;
    const value$ = new Subject<number>();

    run(value$.pipe(output.output(_.context)));
    value$.next(123);
    assert(_.el.getAttribute('attr-in')).to.equal('123');

    value$.next(234);
    assert(_.el.hasAttribute('attr-in')).to.beFalse();
  });

  should('handle handlers correctly', () => {
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.handler;

    const spySubject = createSpy<void, [number]>('handler');
    (_.el as any)['handler'] = spySubject;

    const value = 123;
    run(observableOf([value]).pipe(output.output(_.context)));

    assert(spySubject).to.haveBeenCalledWith(value);
  });

  should('handle on dom correctly', () => {
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.onDom;

    const calledSubject = createSpySubject(fromEvent(_.el, 'ondom'));

    const event$ = new Subject<Event>();
    run(event$.pipe(output.output(_.context)));
    const event = new CustomEvent('ondom');
    event$.next(event);

    assert(calledSubject).to.emitWith(event);
  });

  should('handle hasAttribute correctly', () => {
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.hasAttr;
    const value$ = new Subject<boolean>();

    run(value$.pipe(output.output(_.context)));
    value$.next(true);
    assert(_.el.hasAttribute('has-attr')).to.beTrue();

    value$.next(false);
    assert(_.el.hasAttribute('has-attr')).to.beFalse();
  });

  should('handle hasClass correctly', () => {
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.hasClass;

    const value$ = new Subject<boolean>();

    run(value$.pipe(output.output(_.context)));
    value$.next(true);
    assert(_.el.classList.contains('hasClass')).to.beTrue();

    value$.next(false);
    assert(_.el.classList.contains('hasClass')).to.beFalse();
  });

  should('handle attribute output correctly', () => {
    const input = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.attrOut;

    _.el.setAttribute('attr-out', '456');
    assert(input.getValue(_.context)).to.emitWith(456);

    _.el.setAttribute('attr-out', '789');
    assert(input.getValue(_.context)).to.emitWith(789);

    _.el.removeAttribute('attr-out');
    assert(input.getValue(_.context)).to.emitWith(345);
  });

  should('handle callers correctly', () => {
    const input = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.caller;
    const output = element(ELEMENT_ID, instanceofType(HTMLDivElement), $)._.caller;

    const value = 123;

    const subject = createSpySubject(input.getValue(_.context).pipe(map(([v]) => v)));

    run(observableOf([value]).pipe(output.output(_.context)));
    assert(subject).to.emitWith(value);
  });

  should('handle dispatchers correctly', () => {
    const input = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.dispatcher;

    const event = new CustomEvent('dispatch');
    const valueSpySubject = createSpySubject(input.getValue(_.context));
    _.el.dispatchEvent(event);

    assert(valueSpySubject).to.emitWith(event);
  });

  should('handle setAttribute correctly', () => {
    const input = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.setAttr;

    _.el.setAttribute('set-attr', '');
    assert(input.getValue(_.context)).to.emitWith(true);

    _.el.removeAttribute('set-attr');
    assert(input.getValue(_.context)).to.emitWith(false);
  });

  should('handle classToggle correctly', () => {
    const input = element(ELEMENT_ID, instanceofType(HTMLDivElement), api($))._.classToggle;

    _.el.classList.add('classToggle');

    assert(input.getValue(_.context)).to.emitWith(true);
  });
});
