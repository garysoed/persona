import { assertUnreachable } from 'gs-tools/export/typescript';
import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedHandlerInput } from '../input/handler';
import { UnresolvedOnDomInput } from '../input/on-dom';
import { UnresolvedAttributeOutput } from '../output/attribute';
import { UnresolvedCallerOutput } from '../output/caller';
import { UnresolvedDispatcherOutput } from '../output/dispatcher';

type ConvertibleProperty =
    UnresolvedAttributeInput<any>|
    UnresolvedHandlerInput<any>|
    UnresolvedOnDomInput<any>|
    UnresolvedAttributeOutput<any>|
    UnresolvedCallerOutput<any>|
    UnresolvedDispatcherOutput<any>;

interface UnconvertedSpec {
  readonly [key: string]: ConvertibleProperty;
}

type ConvertedSpec<S> = S extends UnconvertedSpec ? {[K in keyof S]: ConvertedSpec<S[K]>} :
    S extends UnresolvedAttributeInput<infer T> ? UnresolvedAttributeOutput<T> :
    S extends UnresolvedHandlerInput<infer T> ? UnresolvedCallerOutput<T> :
    S extends UnresolvedOnDomInput<infer T> ? UnresolvedDispatcherOutput<T> :
    S extends UnresolvedAttributeOutput<infer T> ? UnresolvedAttributeInput<T> :
    S extends UnresolvedCallerOutput<infer T> ? UnresolvedHandlerInput<T> :
    S extends UnresolvedDispatcherOutput<infer T> ? UnresolvedOnDomInput<T> : never;

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

    convertedSpecs[key] = convert(unconvertedSpec[key]);
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
  } else if (property instanceof UnresolvedCallerOutput) {
    return new UnresolvedHandlerInput(property.functionName);
  } else if (property instanceof UnresolvedOnDomInput) {
    return new UnresolvedDispatcherOutput(property.eventName);
  } else if (property instanceof UnresolvedDispatcherOutput) {
    return new UnresolvedOnDomInput(property.eventName, {});
  } else {
    throw assertUnreachable(property);
  }
}
