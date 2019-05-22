import { filterNonNull } from '@gs-tools/rxjs';
import { Observable } from '@rxjs';
import { distinctUntilChanged, map, pairwise, startWith, tap, withLatestFrom } from '@rxjs/operators';
import { Output } from '../types/output';
import { Resolver, UnresolvedElementProperty } from '../types/unresolved-element-property';
import { applyAttributes, applyInnerText, AttributesSpec, createElementFromSpec } from './create-element-from-spec';
import { createSlotObs } from './create-slot-obs';

export interface RenderData {
  attr?: AttributesSpec;
  innerText?: string;
  tag: string;
}

interface AddSpec {
  attr: AttributesSpec;
  innerText: string;
  tag: string;
  type: 'add';
}

interface ContentSpec {
  attr: AttributesSpec;
  innerText: string;
  type: 'content';
}

interface DeleteSpec {
  type: 'delete';
}

interface ReplaceSpec {
  attr: AttributesSpec;
  innerText: string;
  tag: string;
  type: 'replace';
}

type ChangeSpec = AddSpec|ContentSpec|DeleteSpec|ReplaceSpec;

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

              const normalizedCurrent = {
                attr: current.attr || new Map<string, string>(),
                innerText: current.innerText || '',
                tag: current.tag,
              };

              if (!previous) {
                return {...normalizedCurrent, type: 'add'};
              }

              if (current.tag === previous.tag) {
                return {...normalizedCurrent, type: 'content'};
              }

              return {...normalizedCurrent, type: 'replace'};
            }),
            withLatestFrom(
                parentObs,
                createSlotObs(parentObs, this.slotName).pipe(filterNonNull()),
            ),
            tap(([diff, parentEl, slotEl]) => {
              switch (diff.type) {
                case 'add':
                  parentEl.insertBefore(
                      createElementFromSpec(diff.tag, diff.attr, diff.innerText),
                      slotEl.nextSibling,
                  );
                  break;
                case 'content':
                  if (slotEl.nextSibling instanceof HTMLElement) {
                    applyAttributes(slotEl.nextSibling, diff.attr);
                    applyInnerText(slotEl.nextSibling, diff.innerText);
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
                      createElementFromSpec(diff.tag, diff.attr, diff.innerText),
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
