import { assert, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
import { integerConverter } from 'gs-tools/export/serializer';
import { InstanceofType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { of as observableOf, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { attribute as attributeIn } from '../input/attribute';
import { element } from '../input/element';
import { handler } from '../input/handler';
import { attribute as attributeOut } from '../output/attribute';
import { caller } from '../output/caller';
import { api } from './api';

test('persona.main.api', () => {
  const ELEMENT_ID = 'test';
  const $ = {
    attrIn: attributeIn('attr-in', compose(integerConverter(), human()), 234),
    attrOut: attributeOut('attr-out', compose(integerConverter(), human()), 345),
    caller: caller('caller'),
    handler: handler('handler'),
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

  should(`handle attribute output correctly`, async () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.attrOut;

    el.setAttribute('attr-out', '456');
    await assert(input.getValue(shadowRoot)).to.emitWith(456);

    el.setAttribute('attr-out', '789');
    await assert(input.getValue(shadowRoot)).to.emitWith(789);

    el.removeAttribute('attr-out');
    await assert(input.getValue(shadowRoot)).to.emitWith(345);
  });

  should(`handle handlers correctly`, async () => {
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.handler;

    const spySubject = createSpySubject();
    (el as any)['handler'] = (v: number) => spySubject.next(v);

    const value = 123;
    output.output(shadowRoot, observableOf([value] as [number])).subscribe();

    await assert(spySubject).to.emitWith(value);
  });

  should(`handle callers correctly`, async () => {
    const input = element(ELEMENT_ID, InstanceofType(HTMLDivElement), api($))._.caller;
    const output = element(ELEMENT_ID, InstanceofType(HTMLDivElement), $)._.caller;

    const value = 123;

    const subject = input.getValue(shadowRoot).pipe(map(([v]) => v));

    output.output(shadowRoot, observableOf([value] as [number])).subscribe();
    await assert(subject).to.emitWith(value);
  });
});
