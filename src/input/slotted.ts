import {fromEvent, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedElementProperty} from '../types/unresolved-element-property';


export class SlottedInput implements Input<readonly Node[]> {
  constructor(readonly resolver: Resolver<HTMLSlotElement>) { }

  getValue(context: ShadowContext): Observable<readonly Node[]> {
    const el = this.resolver(context);
    return fromEvent(el, 'slotchange').pipe(
        startWith({}),
        map(() => el.assignedNodes()),
    );
  }
}

export class UnresolvedSlottedInput implements UnresolvedElementProperty<Element, Input<readonly Node[]>> {
  resolve(resolver: Resolver<HTMLSlotElement>): SlottedInput {
    return new SlottedInput(resolver);
  }
}

export function slotted(): UnresolvedSlottedInput {
  return new UnresolvedSlottedInput();
}
