import {Observable, OperatorFunction} from 'rxjs';

import {Bindings, ResolvedBindingSpec, ResolvedI, ResolvedO, UnresolvedBindingSpec} from '../types/ctrl';
import {IOType} from '../types/io';


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
    io: ResolvedI<unknown>|ResolvedO<any, any, any>,
): Observable<unknown>|OutputBinding {
  switch (io.ioType) {
    case IOType.INPUT:
      return io.value$;
    case IOType.OUTPUT:
      return (...args: readonly unknown[]) => io.update(...args);
  }
}