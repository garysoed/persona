import {Observable, OperatorFunction} from 'rxjs';

import {Bindings, ResolvedBindingSpec, ResolvedI, ResolvedO, UnresolvedBindingSpec} from '../types/ctrl';
import {InputOutput, IOType} from '../types/io';

export type OutputBinding = (...args: readonly unknown[]) => OperatorFunction<unknown, unknown>;

export function createBindings<S extends UnresolvedBindingSpec>(spec: ResolvedBindingSpec<S>): Bindings<S> {
  const bindings: Partial<Record<string, Observable<unknown>|OutputBinding>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = createBinding(io);
  }
  return bindings as Bindings<S>;
}

export function createBinding(
    io: InputOutput&(ResolvedI<unknown>|ResolvedO<any, any, any>),
): Observable<unknown>|OutputBinding {
  switch (io.ioType) {
    // TODO(#8): Remove casts, only breaks outside VSCode
    case IOType.INPUT:
      return (io as ResolvedI<unknown>).value$;
    case IOType.OUTPUT:
      return (...args: readonly unknown[]) => (io as ResolvedO<unknown, unknown, unknown[]>).update(...args);
  }
}