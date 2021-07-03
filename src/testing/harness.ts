import {stringify, Verbosity} from 'moirai';
import {Observable, throwError} from 'rxjs';
import {map} from 'rxjs/operators';

import {PersonaContext} from '../../export';
import {AttributeInput} from '../input/attribute';
import {AttributeOutput} from '../output/attribute';
import {PropertySpecs, Resolved} from '../selector/property-spec';
import {Input, INPUT_TYPE} from '../types/input';
import {Output, OUTPUT_TYPE} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector, SELECTOR_TYPE} from '../types/selector';
import {attributeObservable} from '../util/attribute-observable';


type SetterFn<T> = (value: T) => void;

type ResolvedHarness<R extends Resolved<Selectable, PropertySpecs<Selectable>>> = {
  readonly [K in keyof R]: R[K] extends Resolved<any, any> ? ResolvedHarness<R[K]> :
      R[K] extends Input<infer T> ? SetterFn<T> :
      R[K] extends Output<infer T> ? Observable<T> :
      never;
};

type EditedResolvedHarness<R extends Resolved<Selectable, PropertySpecs<Selectable>>> = {
  [K in keyof R]?: ResolvedHarness<Resolved<Selectable, PropertySpecs<Selectable>>>|SetterFn<unknown>|Observable<unknown>;
};

export type Harness<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<any, any> ? ResolvedHarness<S[K]['_']> : never;
}

type EditedHarness<S extends {}> = {
  [K in keyof S]?: ResolvedHarness<Resolved<Selectable, PropertySpecs<Selectable>>>;
}

export function createHarness<S extends {}>(specs: S, context: PersonaContext): Harness<S> {
  const partial: EditedHarness<S> = {};
  for (const key in specs) {
    const entry = specs[key];
    if (!SELECTOR_TYPE.check(entry)) {
      continue;
    }

    partial[key] = createResolvedHarness(entry._, context);
  }
  return partial as Harness<S>;
}

function createResolvedHarness<R extends Resolved<Selectable, PropertySpecs<Selectable>>>(
    resolved: R,
    context: PersonaContext,
): ResolvedHarness<R> {
  const partial: EditedResolvedHarness<R> = {};
  for (const key in resolved) {
    const entry = resolved[key];
    if (INPUT_TYPE.check(entry)) {
      partial[key] = createInputHarness(entry, context);
      continue;
    }

    if (OUTPUT_TYPE.check(entry)) {
      partial[key] = createOutputHarness(entry, context);
      continue;
    }

    if (isResolvedType(entry)) {
      partial[key] = createResolvedHarness(entry, context);
      continue;
    }
  }
  return partial as ResolvedHarness<R>;
}

function createInputHarness<T>(input: Input<T>, context: PersonaContext): SetterFn<T> {
  if (input instanceof AttributeInput) {
    return value => {
      const result = input.parser.convertForward(value);
      if (!result.success) {
        throw new Error(`Invalid value: ${value}`);
      }

      const targetEl = input.resolver(context);
      targetEl.setAttribute(input.attrName, result.result);
    };
  } else {
    return value => {
      throw new Error(
          `Input type ${input} not supported for harness, setting ${value} does nothing`,
      );
    };
  }
}

function createOutputHarness<T>(output: Output<T>, context: PersonaContext): Observable<T> {
  if (output instanceof AttributeOutput) {
    const targetEl = output.resolver(context);
    return attributeObservable(targetEl, output.attrName).pipe(
        map(() => {
          const strValue = targetEl.getAttribute(output.attrName);
          const value = output.parser.convertBackward(strValue || '');
          if (!value.success) {
            if (output.defaultValue !== undefined) {
              return output.defaultValue;
            }

            throw new Error(
                `Value ${stringify(strValue, Verbosity.DEBUG)} is the wrong type for `
                + `${stringify(output, Verbosity.DEBUG)}`,
            );
          }

          return value.result;
        }),
    );
  } else {
    return throwError(new Error(`Output type ${output} not supported for harness`));
  }
}


function isResolvedType<S extends Selectable, P extends PropertySpecs<S>>(
    target: unknown,
): target is Resolved<S, P> {
  return target instanceof Object;
}
