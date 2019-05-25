import { assert, createSpySubject, should, test } from '@gs-testing';
import { integerConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { compose, human } from '@nabu';
import { fromEvent, of as observableOf, ReplaySubject , Subject } from '@rxjs';
import { map } from '@rxjs/operators';
import { attribute as attributeIn } from '../input/attribute';
import { handler } from '../input/handler';
import { hasAttribute } from '../input/has-attribute';
import { hasClass } from '../input/has-class';
import { onDom } from '../input/on-dom';
import { attribute as attributeOut } from '../output/attribute';
import { caller } from '../output/caller';
import { classToggle } from '../output/class-toggle';
import { dispatcher } from '../output/dispatcher';
import { setAttribute } from '../output/set-attribute';
import { api } from './api';
import { element } from './element';

test('@persona/main/api', () => {
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

  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);
  });

  should(`handle attribute input correctly`, () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.attrIn;
    const valueSubject = new Subject<number>();

    output.output(shadowRoot, valueSubject).subscribe();
    valueSubject.next(123);
    assert(el.getAttribute('attr-in')).to.equal(`123`);

    valueSubject.next(234);
    assert(el.hasAttribute('attr-in')).to.beFalse();
  });

  should(`handle handlers correctly`, () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.handler;

    const spySubject = createSpySubject();
    (el as any)['handler'] = (v: number) => spySubject.next(v);

    const value = 123;
    output.output(shadowRoot, observableOf([value] as [number])).subscribe();

    assert(spySubject).to.emitWith(value);
  });

  should(`handle on dom correctly`, () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.onDom;

    const calledSubject = createSpySubject();
    fromEvent(el, 'ondom').subscribe(calledSubject);

    const eventSubject = new Subject<Event>();
    output.output(shadowRoot, eventSubject).subscribe();
    const event = new CustomEvent('ondom');
    eventSubject.next(event);

    assert(calledSubject).to.emitWith(event);
  });

  should(`handle hasAttribute correctly`, () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.hasAttr;
    const valueSubject = new Subject<boolean>();

    output.output(shadowRoot, valueSubject).subscribe();
    valueSubject.next(true);
    assert(el.hasAttribute('has-attr')).to.beTrue();

    valueSubject.next(false);
    assert(el.hasAttribute('has-attr')).to.beFalse();
  });

  should(`handle hasClass correctly`, () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.hasClass;

    const valueSubject = new Subject<boolean>();

    output.output(shadowRoot, valueSubject).subscribe();
    valueSubject.next(true);
    assert(el.classList.contains('hasClass')).to.beTrue();

    valueSubject.next(false);
    assert(el.classList.contains('hasClass')).to.beFalse();
  });

  should(`handle attribute output correctly`, () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.attrOut;

    el.setAttribute('attr-out', '456');
    assert(input.getValue(shadowRoot)).to.emitWith(456);

    el.setAttribute('attr-out', '789');
    assert(input.getValue(shadowRoot)).to.emitWith(789);

    el.removeAttribute('attr-out');
    assert(input.getValue(shadowRoot)).to.emitWith(345);
  });

  should(`handle callers correctly`, () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.caller;
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), $)._.caller;

    const value = 123;

    const subject = new ReplaySubject(1);
    input.getValue(shadowRoot).pipe(map(([v]) => v)).subscribe(subject);

    output.output(shadowRoot, observableOf([value] as [number])).subscribe();
    assert(subject).to.emitWith(value);
  });

  should(`handle dispatchers correctly`, () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.dispatcher;

    const event = new CustomEvent('dispatch');
    const valueSpySubject = createSpySubject();
    input.getValue(shadowRoot).subscribe(valueSpySubject);
    el.dispatchEvent(event);

    assert(valueSpySubject).to.emitWith(event);
  });

  should(`handle setAttribute correctly`, () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.setAttr;

    el.setAttribute('set-attr', '');
    assert(input.getValue(shadowRoot)).to.emitWith(true);

    el.removeAttribute('set-attr');
    assert(input.getValue(shadowRoot)).to.emitWith(false);
  });

  should(`handle classToggle correctly`, () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.classToggle;

    el.classList.add('classToggle');

    assert(input.getValue(shadowRoot)).to.emitWith(true);
  });
});
