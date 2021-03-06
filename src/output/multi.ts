import {$asArray, $filterNonNull, $pipe} from 'gs-tools/export/collect';
import {diffArray} from 'gs-tools/export/rxjs';
import {assertUnreachable} from 'gs-tools/export/typescript';
import {combineLatest, NEVER, Observable, of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {createSlotObs} from '../main/create-slot-obs';
import {__id} from '../render/node-with-id';
import {render} from '../render/render';
import {RenderSpec} from '../render/types/render-spec';
import {Output} from '../types/output';
import {Resolver} from '../types/resolver';
import {Selectable} from '../types/selectable';
import {UnresolvedOutput} from '../types/unresolved-output';


export class MultiOutput implements Output<readonly RenderSpec[]> {
  readonly type = 'out';

  constructor(
      readonly slotName: string,
      readonly resolver: Resolver<Selectable>,
  ) { }

  output(context: ShadowContext): OperatorFunction<readonly RenderSpec[], unknown> {
    const parentEl = this.resolver(context);

    return pipe(
        switchMap(specs => {
          const node$list = specs.map(spec => render(spec, context));
          if (node$list.length <= 0) {
            return observableOf([]);
          }

          return combineLatest(node$list);
        }),
        map(nodes => $pipe(nodes, $filterNonNull(), $asArray())),
        diffArray((a, b) => a[__id] === b[__id]),
        withLatestFrom(
            createSlotObs(observableOf(parentEl), this.slotName),
        ),
        tap(([diff, slotNode]) => {
          if (!slotNode) {
            return;
          }

          switch (diff.type) {
            case 'init':
              for (let i = 0; i < diff.value.length; i++) {
                this.insertEl(parentEl, slotNode, diff.value[i], i);
              }
              return;
            case 'insert':
              this.insertEl(parentEl, slotNode, diff.value, diff.index);
              return;
            case 'delete':
              this.deleteEl(parentEl, slotNode, diff.index);
              return;
            case 'set':
              this.setEl(parentEl, slotNode, diff.value, diff.index);
              return;
            default:
              assertUnreachable(diff);
          }
        }),
    );
  }

  private deleteEl(parentNode: Node, slotNode: Node, index: number): Observable<unknown> {
    const curr = getNode(slotNode, index);

    if (!curr) {
      return NEVER;
    }

    try {
      parentNode.removeChild(curr);
    } catch (e) {
      // ignored
    }

    return NEVER;
  }

  private insertEl(
      parentNode: Selectable,
      slotNode: Node,
      node: Node,
      index: number,
  ): void {
    let curr = slotNode.nextSibling;
    for (let i = 0; i < index && curr !== null; i++) {
      curr = curr.nextSibling;
    }
    parentNode.insertBefore(node, curr);
  }

  private setEl(
      parentNode: Selectable,
      slotNode: Node,
      node: Node,
      index: number,
  ): void {
    this.deleteEl(parentNode, slotNode, index);
    this.insertEl(parentNode, slotNode, node, index);
  }
}

class UnresolvedMultiOutput implements UnresolvedOutput<Selectable, readonly RenderSpec[]> {
  constructor(
      private readonly slotName: string,
  ) { }

  resolve(resolver: Resolver<Selectable>): MultiOutput {
    return new MultiOutput(this.slotName, resolver);
  }
}

export function multi(
    slotName: string,
): UnresolvedMultiOutput {
  return new UnresolvedMultiOutput(slotName);
}

function getNode(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}
