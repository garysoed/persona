import { InstanceStreamId, instanceStreamId } from '@grapevine/component';
import { BooleanType } from '@gs-types';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { mutationObservable } from '../util/mutation-observable';

export class HasAttributeInput implements Input<boolean> {
  readonly id: InstanceStreamId<boolean>;

  constructor(
      readonly attrName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`attr[${attrName}]`, BooleanType);
  }

  getValue(root: ShadowRoot): Observable<boolean> {
    return this.resolver(root)
        .pipe(
            switchMap(el =>
                mutationObservable(
                    el,
                    {
                      attributeFilter: [this.attrName],
                      attributes: true,
                    },
                )
                .pipe(
                    map(() => el.hasAttribute(this.attrName)),
                    startWith(el.hasAttribute(this.attrName)),
                ),
            ),
            distinctUntilChanged(),
            shareReplay(1),
        );
  }
}

export class UnresolvedHasAttributeInput implements
    UnresolvedElementProperty<Element, HasAttributeInput> {
  constructor(readonly attrName: string) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): HasAttributeInput {
    return new HasAttributeInput(this.attrName, resolver);
  }
}

export function hasAttribute(attrName: string): UnresolvedHasAttributeInput {
  return new UnresolvedHasAttributeInput(attrName);
}
