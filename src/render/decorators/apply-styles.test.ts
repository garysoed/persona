import {assert, createSpySubject, should, test} from 'gs-testing';
import {of} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {setId} from '../set-id';

import {applyStyles} from './apply-styles';


test('@persona/src/render/decorators/apply-styles', init => {
  const _ = init(() => {
    const el = setId(document.createElement('div'), 'id');
    return {el};
  });

  should('add the styles correctly', () => {
    const styles = new Map([['height', '1px'], ['width', '2px']]);
    const onUpdate$ = applyStyles(of(styles))(_.el)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const styles$ = createSpySubject(
        onUpdate$.pipe(map(() => `${_.el.style.width},${_.el.style.height}`)),
        1,
    );

    assert(styles$).to.emitSequence(['2px,1px']);
  });

  should('delete the styles correctly', () => {
    const styleMap$ = of(
        new Map([['height', '1px'], ['width', '2px']]),
        new Map([['height', '1px']]),
    );
    const onUpdate$ = applyStyles(styleMap$)(_.el)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const styles$ = createSpySubject(
        onUpdate$.pipe(map(() => `${_.el.style.width},${_.el.style.height}`)),
        1,
    );

    assert(styles$).to.emitSequence([',1px']);
  });
});
