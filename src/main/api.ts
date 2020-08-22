import { assertUnreachable } from 'gs-tools/export/typescript';

import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHandlerInput } from '../input/handler';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { UnresolvedHasClassInput } from '../input/has-class';
import { UnresolvedOnDomInput } from '../input/on-dom';
import { UnresolvedPropertyObserver } from '../input/property-observer';
import { UnresolvedAttributeOutput } from '../output/attribute';
import { UnresolvedCallerOutput } from '../output/caller';
import { UnresolvedClassToggleOutput } from '../output/class-toggle';
import { UnresolvedDispatcherOutput } from '../output/dispatcher';
import { UnresolvedPropertyEmitter } from '../output/property-emitter';
import { UnresolvedSetAttributeOutput } from '../output/set-attribute';


export type UnconvertedInput =
    UnresolvedAttributeInput<any>|
    UnresolvedHandlerInput|
    UnresolvedOnDomInput<any>|
    UnresolvedHasAttributeInput|
    UnresolvedHasClassInput|
    UnresolvedPropertyObserver<any>;

export type UnconvertedOutput =
    UnresolvedAttributeOutput<any>|
    UnresolvedCallerOutput<any>|
    UnresolvedDispatcherOutput<any>|
    UnresolvedSetAttributeOutput|
    UnresolvedClassToggleOutput|
    UnresolvedPropertyEmitter<any>;

type ConvertibleProperty = UnconvertedInput|UnconvertedOutput;

export interface UnconvertedSpec {
  readonly [key: string]: ConvertibleProperty;
}

export type ConvertedSpec<S> = S extends UnconvertedSpec ? {[K in keyof S]: ConvertedSpec<S[K]>} :
    S extends UnresolvedAttributeInput<infer T> ? UnresolvedAttributeOutput<T> :
    S extends UnresolvedHandlerInput ? UnresolvedCallerOutput<unknown[]> :
    S extends UnresolvedOnDomInput<infer T> ? UnresolvedDispatcherOutput<T> :
    S extends UnresolvedHasAttributeInput ? UnresolvedSetAttributeOutput :
    S extends UnresolvedHasClassInput ? UnresolvedClassToggleOutput :
    S extends UnresolvedPropertyObserver<infer T> ? UnresolvedPropertyEmitter<T> :
    S extends UnresolvedAttributeOutput<infer T> ? UnresolvedAttributeInput<T> :
    S extends UnresolvedCallerOutput<readonly any[]> ? UnresolvedHandlerInput :
    S extends UnresolvedDispatcherOutput<infer T> ? UnresolvedOnDomInput<T> :
    S extends UnresolvedSetAttributeOutput ? UnresolvedHasAttributeInput :
    S extends UnresolvedClassToggleOutput ? UnresolvedHasClassInput :
    S extends UnresolvedPropertyEmitter<infer T> ? UnresolvedPropertyObserver<T> :
    never;

/**
 * Takes a spec, and converts it to an API.
 */
export function api<U extends UnconvertedSpec>(spec: U): ConvertedSpec<U> {
  const convertedSpecs: Partial<ConvertedSpec<U>> = {};
  const unconvertedSpec = spec as UnconvertedSpec;
  for (const key in unconvertedSpec) {
    if (!spec.hasOwnProperty(key)) {
      continue;
    }

    convertedSpecs[key as keyof ConvertedSpec<U>] = convert(unconvertedSpec[key]) as any;
  }

  return convertedSpecs as ConvertedSpec<U>;
}

function convert(property: ConvertibleProperty): ConvertibleProperty {
  if (property instanceof UnresolvedAttributeInput) {
    return new UnresolvedAttributeOutput(
        property.attrName,
        property.parser,
        property.defaultValue,
    );
  } else if (property instanceof UnresolvedAttributeOutput) {
    return new UnresolvedAttributeInput(
        property.attrName,
        property.parser,
        property.deleteValue,
    );
  } else if (property instanceof UnresolvedHandlerInput) {
    return new UnresolvedCallerOutput(property.functionName);
  } else if (property instanceof UnresolvedHasAttributeInput) {
    return new UnresolvedSetAttributeOutput(property.attrName);
  } else if (property instanceof UnresolvedHasClassInput) {
    return new UnresolvedClassToggleOutput(property.className);
  } else if (property instanceof UnresolvedPropertyObserver) {
    return new UnresolvedPropertyEmitter(property.propertyName);
  } else if (property instanceof UnresolvedCallerOutput) {
    return new UnresolvedHandlerInput(property.functionName);
  } else if (property instanceof UnresolvedOnDomInput) {
    return new UnresolvedDispatcherOutput(property.eventName);
  } else if (property instanceof UnresolvedDispatcherOutput) {
    return new UnresolvedOnDomInput(property.eventName, {});
  } else if (property instanceof UnresolvedSetAttributeOutput) {
    return new UnresolvedHasAttributeInput(property.attrName);
  } else if (property instanceof UnresolvedClassToggleOutput) {
    return new UnresolvedHasClassInput(property.className);
  } else if (property instanceof UnresolvedPropertyEmitter) {
    return new UnresolvedPropertyObserver(property.propertyName);
  } else {
    throw assertUnreachable(property);
  }
}
