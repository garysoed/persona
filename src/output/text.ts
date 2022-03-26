import {stringType} from 'gs-types';
import {EMPTY, merge, of, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {RenderContext} from '../render/types/render-context';
import {renderTextNode} from '../render/types/render-text-node-spec';
import {Reference, ReferenceO} from '../types/ctrl';
import {ApiType, IOType, OText, RenderValueFn} from '../types/io';
import {Target} from '../types/target';

import {ocase} from './case';


class ResolvedOText implements Reference<OText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      private readonly caseOutput: ReferenceO<string, string, [RenderValueFn<string>]>,
  ) {}

  resolve(target: Target, context: RenderContext): () => OperatorFunction<string, string> {
    return () => {
      return value$ => {
        const render$ = value$.pipe(
            this.caseOutput.resolve(target, context)(value => of(renderTextNode({
              textContent: of(value),
            }))),
            switchMapTo(EMPTY),
        );
        return merge(render$, value$);
      };
    };
  }
}

export function otext(): ResolvedOText {
  return new ResolvedOText(ocase(stringType));
}
