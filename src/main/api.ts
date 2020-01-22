import { assertUnreachable } from '@gs-tools/typescript';

import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHandlerInput } from '../input/handler';
import { UnresolvedHasAttributeInput } from '../input/has-attribute';
import { UnresolvedHasClassInput } from '../input/has-class';
import { UnresolvedOnDomInput } from '../input/on-dom';
import { UnresolvedAttributeOutput } from '../output/attribute';
import { UnresolvedCallerOutput } from '../output/caller';
import { UnresolvedClassToggleOutput } from '../output/class-toggle';
import { UnresolvedDispatcherOutput } from '../output/dispatcher';
import { UnresolvedSetAttributeOutput } from '../output/set-attribute';

type ConvertibleProperty =
    UnresolvedAttributeInput<any>|
    UnresolvedHandlerInput<any>|
    UnresolvedOnDomInput<any>|
    UnresolvedHasAttributeInput|
    UnresolvedHasClassInput|
    UnresolvedAttributeOutput<any>|
    UnresolvedCallerOutput<any>|
    UnresolvedDispatcherOutput<any>|
    UnresolvedSetAttributeOutput|
    UnresolvedClassToggleOutput;

export interface UnconvertedSpec {
  readonly [key: string]: ConvertibleProperty;
}

export type ConvertedSpec<S> = S extends UnconvertedSpec ? {[K in keyof S]: ConvertedSpec<S[K]>} :
    S extends UnresolvedAttributeInput<infer T> ? UnresolvedAttributeOutput<T> :
    S extends UnresolvedHandlerInput<infer T> ? UnresolvedCallerOutput<T> :
    S extends UnresolvedOnDomInput<infer T> ? UnresolvedDispatcherOutput<T> :
    S extends UnresolvedHasAttributeInput ? UnresolvedSetAttributeOutput :
    S extends UnresolvedHasClassInput ? UnresolvedClassToggleOutput :
    S extends UnresolvedAttributeOutput<infer T> ? UnresolvedAttributeInput<T> :
    S extends UnresolvedCallerOutput<infer T> ? UnresolvedHandlerInput<T> :
    S extends UnresolvedDispatcherOutput<infer T> ? UnresolvedOnDomInput<T> :
    S extends UnresolvedSetAttributeOutput ? UnresolvedHasAttributeInput :
    S extends UnresolvedClassToggleOutput ? UnresolvedHasClassInput : never;

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
  } else {
    throw assertUnreachable(property);
  }
}
