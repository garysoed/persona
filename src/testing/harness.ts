import {Observable, throwError} from 'rxjs';

import {ShadowContext} from '../core/shadow-context';
import {AttributeInput} from '../input/attribute';
import {HandlerInput} from '../input/handler';
import {HasAttributeInput} from '../input/has-attribute';
import {OnDomInput} from '../input/on-dom';
import {OnInputInput} from '../input/on-input';
import {OnKeydownInput} from '../input/on-keydown';
import {SlottedInput} from '../input/slotted';
import {TextInput} from '../input/text-in';
import {AttributeOutput} from '../output/attribute';
import {ClassToggleOutput} from '../output/class-toggle';
import {ClasslistOutput} from '../output/classlist';
import {DispatcherOutput} from '../output/dispatcher';
import {SetAttributeOutput} from '../output/set-attribute';
import {StyleOutput} from '../output/style';
import {TextOutput} from '../output/text-out';
import {PropertySpecs, Resolved} from '../selector/property-spec';
import {Input, INPUT_TYPE} from '../types/input';
import {Output, OUTPUT_TYPE} from '../types/output';
import {Selectable} from '../types/selectable';
import {Selector, SELECTOR_TYPE} from '../types/selector';

import {attributeInputHarness, handlerInputHarness, hasAttributeInputHarness, onDomInputHarness, onInputInputHarness, onKeydownInputHarness, slottedInputHarness, textInputHarness} from './input-harnesses';
import {attributeOutputHarness, classlistOutputHarness, classToggleOutputHarness, dispatcherOutputHarness, setAttributeOutputHarness, styleOutputHarness, textOutputHarness} from './output-harnesses';


type GenericResolved = Resolved<Selectable, PropertySpecs<Selectable>>;
type SetterFn<T> = (value: T) => void;

type InputHarnessOf<I> =
    I extends OnKeydownInput ? SetterFn<void> :
    I extends SlottedInput ? SetterFn<Element|null> :
    I extends OnDomInput<infer E> ? SetterFn<E|void> :
    I extends Input<infer T> ? SetterFn<T> :
    never;

type ResolvedHarness<R extends GenericResolved> = {
  readonly [K in keyof R]: R[K] extends Resolved<any, any> ? ResolvedHarness<R[K]> :
      R[K] extends Input<any> ? InputHarnessOf<R[K]> :
      R[K] extends Output<infer T> ? Observable<T> :
      never;
};

type EditedResolvedHarness<R extends GenericResolved> = {
  [K in keyof R]?: ResolvedHarness<GenericResolved>|SetterFn<unknown>|Observable<unknown>;
};

export type Harness<S extends {}> = {
  readonly [K in keyof S]: S[K] extends Selector<infer E, any> ? SelectorHarness<E, S[K]['_']> : never;
}

type EditedHarness<S extends {}> = {
  [K in keyof S]?: SelectorHarness<Selectable, GenericResolved>;
}

class SelectorHarness<S extends Selectable, R extends Resolved<S, PropertySpecs<S>>> {
  readonly _: ResolvedHarness<R> = createResolvedHarness(this.resolved, this.context);

  constructor(
      private readonly resolved: R,
      private readonly context: ShadowContext,
      readonly selectable: S,
  ) {}
}

export function createHarness<S extends {}>(specs: S, context: ShadowContext): Harness<S> {
  const partial: EditedHarness<S> = {};
  for (const key in specs) {
    const entry = specs[key];
    if (!SELECTOR_TYPE.check(entry)) {
      continue;
    }

    partial[key] = new SelectorHarness(
        entry._,
        context,
        entry.getSelectable(context),
    );
  }
  return partial as Harness<S>;
}

function createResolvedHarness<R extends GenericResolved>(
    resolved: R,
    context: ShadowContext,
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

function createInputHarness<T>(input: Input<T>, context: ShadowContext): InputHarnessOf<T>;
function createInputHarness(input: Input<unknown>, context: ShadowContext): SetterFn<any> {
  if (input instanceof AttributeInput) {
    return attributeInputHarness(input, context);
  } else if (input instanceof HandlerInput) {
    return handlerInputHarness(input, context);
  } else if (input instanceof HasAttributeInput) {
    return hasAttributeInputHarness(input, context);
  } else if (input instanceof OnInputInput) {
    return onInputInputHarness(input, context);
  } else if (input instanceof OnKeydownInput) {
    return onKeydownInputHarness(input, context);
  } else if (input instanceof SlottedInput) {
    return slottedInputHarness(input, context);
  } else if (input instanceof TextInput) {
    return textInputHarness(input, context);
  } else if (input instanceof OnDomInput) {
    return onDomInputHarness(input, context);
  } else {
    return value => {
      throw new Error(
          `Input type ${input} not supported for harness, setting ${value} does nothing`,
      );
    };
  }
}

function createOutputHarness<T>(output: Output<T>, context: ShadowContext): Observable<T>;
function createOutputHarness(output: Output<unknown>, context: ShadowContext): Observable<unknown> {
  if (output instanceof AttributeOutput) {
    return attributeOutputHarness(output, context);
  } else if (output instanceof ClassToggleOutput) {
    return classToggleOutputHarness(output, context);
  } else if (output instanceof ClasslistOutput) {
    return classlistOutputHarness(output, context);
  } else if (output instanceof DispatcherOutput) {
    return dispatcherOutputHarness(output, context);
  } else if (output instanceof SetAttributeOutput) {
    return setAttributeOutputHarness(output, context);
  } else if (output instanceof StyleOutput) {
    return styleOutputHarness(output, context);
  } else if (output instanceof TextOutput) {
    return textOutputHarness(output, context);
  } else {
    return throwError(new Error(`Output type ${output} not supported for harness`));
  }
}


function isResolvedType<S extends Selectable, P extends PropertySpecs<S>>(
    target: unknown,
): target is Resolved<S, P> {
  return target instanceof Object;
}
