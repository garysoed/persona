import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Input } from '../component/input';
import { BaseComponentSpec } from '../main/component-spec';

export interface Spec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Iterable<Input<any>>;
  shadowMode?: 'open'|'closed';
}

export type BaseCustomElement = (spec: Spec) => ClassDecorator;

export function baseCustomElementFactory(
    baseCustomElementAnnotationsCache: Annotations<BaseComponentSpec>,
): BaseCustomElement {
  return (spec: Spec) => {
    return (target: Function) => {
      baseCustomElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        input: spec.input,
      });
    };
  };
}
