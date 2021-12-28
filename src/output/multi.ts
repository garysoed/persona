import {$asArray, $filterNonNull, $pipe} from 'gs-tools/export/collect';
import {diffArray, filterNonNullable} from 'gs-tools/export/rxjs';
import {assertUnreachable} from 'gs-tools/export/typescript';
import {combineLatest, EMPTY, merge, NEVER, Observable, of, OperatorFunction} from 'rxjs';
import {map, switchMap, switchMapTo, tap, withLatestFrom} from 'rxjs/operators';

import {render} from '../render/render';
import {__id} from '../render/types/node-with-id';
import {RenderContext} from '../render/types/render-context';
import {RenderSpec} from '../render/types/render-spec';
import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OMulti} from '../types/io';
import {Selectable} from '../types/selectable';
import {Target} from '../types/target';
import {initSlot} from '../util/init-slot';


class ResolvedOMulti implements Resolved<UnresolvedOMulti> {
  readonly apiType = ApiType.MULTI;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
      readonly target: Target,
      private readonly context: RenderContext,
  ) {}

  update(): OperatorFunction<readonly RenderSpec[], readonly RenderSpec[]> {
    const slotEl$ = of(this.target).pipe(
        initSlot(this.slotName),
        filterNonNullable(),
    );

    return specs$ => {
      const render$ = specs$.pipe(
          switchMap(specs => {
            const node$list = specs.map(spec => render(spec, this.context));
            if (node$list.length <= 0) {
              return of([]);
            }

            return combineLatest(node$list);
          }),
          map(nodes => $pipe(nodes, $filterNonNull(), $asArray())),
          diffArray((a, b) => a[__id] === b[__id]),
          withLatestFrom(slotEl$),
          tap(([diff, slotNode]) => {
            if (!slotNode) {
              return;
            }

            switch (diff.type) {
              case 'init':
                for (let i = 0; i < diff.value.length; i++) {
                  this.insertEl(this.target, slotNode, diff.value[i], i);
                }
                return;
              case 'insert':
                this.insertEl(this.target, slotNode, diff.value, diff.index);
                return;
              case 'delete':
                this.deleteEl(this.target, slotNode, diff.index);
                return;
              case 'set':
                this.setEl(this.target, slotNode, diff.value, diff.index);
                return;
              default:
                assertUnreachable(diff);
            }
          }),
          switchMapTo(EMPTY),
      );

      return merge(specs$, render$);
    };
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

class UnresolvedOMulti implements UnresolvedIO<OMulti> {
  readonly apiType = ApiType.MULTI;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly slotName: string,
  ) {}

  resolve(target: Target, context: RenderContext): ResolvedOMulti {
    return new ResolvedOMulti(this.slotName, target, context);
  }
}

function getNode(slotNode: Node, index: number): Node|null {
  let curr = slotNode.nextSibling;
  for (let i = 0; i < index && curr !== null; i++) {
    curr = curr.nextSibling;
  }

  return curr;
}

export function omulti(refName: string): UnresolvedOMulti {
  return new UnresolvedOMulti(refName);
}

