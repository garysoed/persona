import {stringType} from 'gs-types';
import {EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {RenderContext} from '../render/types/render-context';
import {renderTextNode} from '../render/types/render-text-node-spec';
import {Resolved, ResolvedO, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OText, RenderValueFn} from '../types/io';
import {Target} from '../types/target';

import {ocase} from './case';


class ResolvedOText implements Resolved<UnresolvedOText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly target: Target,
      private readonly caseOutput: ResolvedO<string, string, [RenderValueFn<string>]>,
  ) {}

  update(): OperatorFunction<string, string> {
    return value$ => {
      const render$ = value$.pipe(
          this.caseOutput.update(value => of(renderTextNode({
            id: value,
            textContent: of(value),
          }))),
          switchMapTo(EMPTY),
      );
      return merge(render$, value$);
    };
  }
}

class UnresolvedOText implements UnresolvedIO<OText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.OUTPUT;

  resolve(target: Target, context: RenderContext): ResolvedOText {
    return new ResolvedOText(target, ocase(stringType).resolve(target, context));
  }
}

export function otext(): UnresolvedOText {
  return new UnresolvedOText();
}
