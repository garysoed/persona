import {assert, run, should, test} from 'gs-testing';
import {of as observableOf, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {setId} from '../set-id';

import {applyTextContent} from './apply-text-content';


test('@persona/render/decorators/apply-text-content', () => {

  should('update the textContent', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const decorator = applyTextContent(observableOf(text1, text2));
    const node = setId(document.createTextNode('init'), 'id');

    const text$ = new ReplaySubject();
    run(decorator(node).pipe(tap(() => text$.next(node.textContent))));

    assert(text$).to.emitSequence([text1, text2]);
  });
});
