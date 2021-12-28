import {of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap} from 'rxjs/operators';

import {RenderSpec} from '../../export';
import {RenderContext} from '../render/types/render-context';
import {renderTextNode} from '../render/types/render-text-node-spec';
import {Resolved, ResolvedO, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, OText} from '../types/io';
import {Target} from '../types/target';

import {osingle} from './single';


class ResolvedOText implements Resolved<UnresolvedOText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.OUTPUT;

  constructor(
      readonly target: Target,
      private readonly singleOutput: ResolvedO<RenderSpec, unknown>,
  ) {}

  update(): OperatorFunction<string, string> {
    return pipe(
        switchMap(value => {
          const spec = renderTextNode({
            id: value,
            textContent: value,
          });
          return of(spec).pipe(
              this.singleOutput.update(),
              mapTo(value),
          );
        }),
    );
  }
}

class UnresolvedOText implements UnresolvedIO<OText> {
  readonly apiType = ApiType.TEXT;
  readonly ioType = IOType.OUTPUT;

  resolve(target: Target, context: RenderContext): ResolvedOText {
    return new ResolvedOText(target, osingle().resolve(target, context));
  }
}

export function otext(): UnresolvedOText {
  return new UnresolvedOText();
}
