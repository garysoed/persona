import {Observable, fromEvent} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {PersonaContext} from '../core/persona-context';
import {Input} from '../types/input';
import {Resolver} from '../types/resolver';
import {UnresolvedInput} from '../types/unresolved-input';


export class SlottedInput implements Input<readonly Node[]> {
  constructor(readonly resolver: Resolver<HTMLSlotElement>) { }

  getValue(context: PersonaContext): Observable<readonly Node[]> {
    const el = this.resolver(context);
    return fromEvent(el, 'slotchange').pipe(
        startWith({}),
        map(() => el.assignedNodes()),
    );
  }
}

export class UnresolvedSlottedInput implements UnresolvedInput<readonly Node[]> {
  resolve(resolver: Resolver<HTMLSlotElement>): SlottedInput {
    return new SlottedInput(resolver);
  }
}

export function slotted(): UnresolvedSlottedInput {
  return new UnresolvedSlottedInput();
}
