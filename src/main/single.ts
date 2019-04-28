import { Observable } from '@rxjs';
import { distinctUntilChanged, map, pairwise, startWith, tap, withLatestFrom } from '@rxjs/operators';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { Output } from '../types/output';
import { Resolver, UnresolvedElementProperty } from '../types/unresolved-element-property';
import { applyAttributes, createElementFromSpec } from './create-element-from-spec';
import { createSlotObs } from './create-slot-obs';

export interface RenderData {
  attr: Map<string, string>;
  tag: string;
}

interface AddSpec {
  attr: Iterable<[string, string]>;
  tag: string;
  type: 'add';
}

interface AttributeSpec {
  attr: Iterable<[string, string]>;
  type: 'attribute';
}

interface DeleteSpec {
  type: 'delete';
}

interface ReplaceSpec {
  attr: Iterable<[string, string]>;
  tag: string;
  type: 'replace';
}

type ChangeSpec = AddSpec|AttributeSpec|DeleteSpec|ReplaceSpec;

export class SingleOutput implements Output<RenderData|null> {
  constructor(
      readonly slotName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) { }

  output(root: ShadowRoot, valueObs: Observable<RenderData|null>): Observable<unknown> {
    const parentObs = this.resolver(root);

    return valueObs
        .pipe(
            startWith(null),
            distinctUntilChanged(),
            pairwise(),
            map<[RenderData|null, RenderData|null], ChangeSpec>(([previous, current]) => {
              if (!current) {
                return {type: 'delete'};
              }

              if (!previous) {
                return {...current, type: 'add'};
              }

              if (current.tag === previous.tag) {
                return {attr: current.attr, type: 'attribute'};
              }

              return {...current, type: 'replace'};
            }),
            withLatestFrom(
                parentObs,
                createSlotObs(parentObs, this.slotName).pipe(filterNonNull()),
            ),
            tap(([diff, parentEl, slotEl]) => {
              switch (diff.type) {
                case 'add':
                  parentEl.insertBefore(
                      createElementFromSpec(diff.tag, diff.attr),
                      slotEl.nextSibling,
                  );
                  break;
                case 'attribute':
                  if (slotEl.nextSibling instanceof HTMLElement) {
                    applyAttributes(slotEl.nextSibling, diff.attr);
                  }
                  break;
                case 'delete':
                  if (slotEl.nextSibling) {
                    parentEl.removeChild(slotEl.nextSibling);
                  }
                  break;
                case 'replace':
                  if (slotEl.nextSibling) {
                    parentEl.removeChild(slotEl.nextSibling);
                  }

                  parentEl.insertBefore(
                      createElementFromSpec(diff.tag, diff.attr),
                      slotEl.nextSibling,
                  );
                  break;
              }
            }),
        );
  }
}

class UnresolvedSingleOutput implements UnresolvedElementProperty<Element, SingleOutput> {
  constructor(readonly slotName: string) { }

  resolve(resolver: Resolver<Element>): SingleOutput {
    return new SingleOutput(this.slotName, resolver);
  }
}

export function single(slotName: string): UnresolvedSingleOutput {
  return new UnresolvedSingleOutput(slotName);
}
