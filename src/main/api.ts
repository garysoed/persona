import {assertUnreachable} from 'gs-tools/export/typescript';

import {UnresolvedAttributeInput} from '../input/attribute';
import {UnresolvedHandlerInput} from '../input/handler';
import {UnresolvedHasAttributeInput} from '../input/has-attribute';
import {UnresolvedHasClassInput} from '../input/has-class';
import {UnresolvedOnDomInput} from '../input/on-dom';
import {UnresolvedPropertyObserver} from '../input/property-observer';
import {UnresolvedTextInput} from '../input/text-in';
import {UnresolvedAttributeOutput} from '../output/attribute';
import {UnresolvedCallerOutput} from '../output/caller';
import {UnresolvedClassToggleOutput} from '../output/class-toggle';
import {UnresolvedDispatcherOutput} from '../output/dispatcher';
import {UnresolvedPropertyEmitter} from '../output/property-emitter';
import {UnresolvedSetAttributeOutput} from '../output/set-attribute';
import {UnresolvedTextOutput} from '../output/text-out';


export type UnresolvedInput =
    UnresolvedAttributeInput<any>|
    UnresolvedHandlerInput|
    UnresolvedOnDomInput<any>|
    UnresolvedHasAttributeInput|
    UnresolvedHasClassInput|
    UnresolvedPropertyObserver<any>|
    UnresolvedTextInput;

export type UnresolvedOutput =
    UnresolvedAttributeOutput<any>|
    UnresolvedCallerOutput<any>|
    UnresolvedDispatcherOutput<any>|
    UnresolvedSetAttributeOutput|
    UnresolvedClassToggleOutput|
    UnresolvedPropertyEmitter<any>|
    UnresolvedTextOutput;

type ResolvableProperty = UnresolvedInput|UnresolvedOutput;

export interface UnresolvedSpec {
  readonly [key: string]: ResolvableProperty;
}

export type ResolvedSpec<S> = S extends UnresolvedSpec ? {[K in keyof S]: ResolvedSpec<S[K]>} :
    S extends UnresolvedAttributeInput<infer T> ? UnresolvedAttributeOutput<T> :
    S extends UnresolvedHandlerInput ? UnresolvedCallerOutput<unknown[]> :
    S extends UnresolvedOnDomInput<infer T> ? UnresolvedDispatcherOutput<T> :
    S extends UnresolvedHasAttributeInput ? UnresolvedSetAttributeOutput :
    S extends UnresolvedHasClassInput ? UnresolvedClassToggleOutput :
    S extends UnresolvedPropertyObserver<infer T> ? UnresolvedPropertyEmitter<T> :
    S extends UnresolvedTextInput ? UnresolvedTextOutput :
    S extends UnresolvedAttributeOutput<infer T> ? UnresolvedAttributeInput<T> :
    S extends UnresolvedCallerOutput<readonly any[]> ? UnresolvedHandlerInput :
    S extends UnresolvedDispatcherOutput<infer T> ? UnresolvedOnDomInput<T> :
    S extends UnresolvedSetAttributeOutput ? UnresolvedHasAttributeInput :
    S extends UnresolvedClassToggleOutput ? UnresolvedHasClassInput :
    S extends UnresolvedPropertyEmitter<infer T> ? UnresolvedPropertyObserver<T> :
    S extends UnresolvedTextOutput ? UnresolvedTextInput :
    never;

/**
 * Takes a spec, and converts it to an API.
 */
export function api<U extends UnresolvedSpec>(spec: U): ResolvedSpec<U> {
  const convertedSpecs: Partial<ResolvedSpec<U>> = {};
  const unconvertedSpec = spec as UnresolvedSpec;
  for (const key in unconvertedSpec) {
    if (!spec.hasOwnProperty(key)) {
      continue;
    }

    convertedSpecs[key as keyof ResolvedSpec<U>] = convert(unconvertedSpec[key]) as any;
  }

  return convertedSpecs as ResolvedSpec<U>;
}

function convert(property: ResolvableProperty): ResolvableProperty {
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
  } else if (property instanceof UnresolvedTextInput) {
    return new UnresolvedTextOutput();
  } else if (property instanceof UnresolvedDispatcherOutput) {
    return new UnresolvedOnDomInput(property.eventName, {});
  } else if (property instanceof UnresolvedSetAttributeOutput) {
    return new UnresolvedHasAttributeInput(property.attrName);
  } else if (property instanceof UnresolvedClassToggleOutput) {
    return new UnresolvedHasClassInput(property.className);
  } else if (property instanceof UnresolvedPropertyEmitter) {
    return new UnresolvedPropertyObserver(property.propertyName);
  } else if (property instanceof UnresolvedTextOutput) {
    return new UnresolvedTextInput();
  } else {
    throw assertUnreachable(property);
  }
}
