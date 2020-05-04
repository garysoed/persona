import { assert, run, should, test } from 'gs-testing';
import { BehaviorSubject, of as observableOf } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';

import { SimpleElementRenderSpec } from './simple-element-render-spec';

test('@persona/render/simple-element-render-spec', () => {
  test('canReuseElement', () => {
    should(`return true if the tag names are the same`, () => {
      const el = document.createElement('div');
      const spec = new SimpleElementRenderSpec('div', observableOf(new Map()), observableOf(''));
      assert(spec.canReuseElement(el)).to.beTrue();
    });

    should(`return false if the tag names are different`, () => {
      const el = document.createElement('b');
      const spec = new SimpleElementRenderSpec('div', observableOf(new Map()), observableOf(''));
      assert(spec.canReuseElement(el)).to.beFalse();
    });
  });

  test('createElement', () => {
    should(`create the element correctly`, () => {
      const spec = new SimpleElementRenderSpec('div', observableOf(new Map()), observableOf(''));
      const el$ = spec.createElement();

      assert(el$.pipe(map(el => el.tagName.toLowerCase()))).to.emitWith('div');
    });
  });

  test('registerElement', () => {
    should(`update the attributes and inner text correctly`, () => {
      const attrs$ = new BehaviorSubject(new Map([['added', '123'], ['updated', '345']]));
      const text$ = new BehaviorSubject('innerText');
      const spec = new SimpleElementRenderSpec('div', attrs$, text$);
      const el$ = spec.createElement();
      run(el$.pipe(tap(el => el.setAttribute('updated', 'abc'))));
      run(el$.pipe(switchMap(el => spec.registerElement(el))));

      assert(el$.pipe(map(el => el.getAttribute('added')))).to.emitWith('123');
      assert(el$.pipe(map(el => el.getAttribute('updated')))).to.emitWith('345');
      assert(el$.pipe(map(el => el.textContent))).to.emitWith('innerText');

      // Change the values.
      attrs$.next(new Map([['added', '345'], ['updated', '567']]));
      text$.next('newText');

      assert(el$.pipe(map(el => el.getAttribute('added')))).to.emitWith('345');
      assert(el$.pipe(map(el => el.getAttribute('updated')))).to.emitWith('567');
      assert(el$.pipe(map(el => el.textContent))).to.emitWith('newText');
    });
  });
});
