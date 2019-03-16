import { UnresolvedAttributeInput } from '../input/attribute';
import { UnresolvedDispatcherInput } from '../output/dispatcher';

type ConvertibleProperty =
    UnresolvedAttributeInput<any>|
    UnresolvedDispatcherInput<any>|
    UnresolvedHandlerInput<any>|
    Unresolved;

type UnconvertedSpec<E extends Element> = {
  readonly [key: string]: ConvertibleProperty;
};

/**
 * Takes a spec, and converts it to an API.
 */
export function api<E extends Element, U extends UnconvertedSpec<E>>(spec: U): ConvertedSpec<U> {

}
