import {OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ApiType, IOType, OProperty} from '../types/io';

export class ResolvedOProperty implements OProperty {
  readonly apiType = ApiType.PROPERTY;
  readonly ioType = IOType.OUTPUT;

  constructor(readonly propertyName: string) {}

  resolve(target: HTMLElement): () => OperatorFunction<string, string> {
    return () => {
      return tap(value => {
        target.style.setProperty(this.propertyName, value);
      });
    };
  }
}

export function oproperty(propertyName: string): ResolvedOProperty {
  return new ResolvedOProperty(propertyName);
}