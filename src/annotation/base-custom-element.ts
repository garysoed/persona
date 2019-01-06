import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Input } from '../component/input';
import { BaseComponentSpec, OnCreateSpec, RendererSpec } from '../main/component-spec';

interface Spec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Iterable<Input<any>>;
  shadowMode?: 'open'|'closed';
}

export type BaseCustomElement = (spec: Spec) => ClassDecorator;

export function baseCustomElementFactory(
    onCreateAnnotationsCache: Annotations<OnCreateSpec>,
    rendererAnnotationsCache: Annotations<RendererSpec>,
    baseCustomElementAnnotationsCache: Annotations<BaseComponentSpec>,
): BaseCustomElement {
  return (spec: Spec) => {
    return (target: Function) => {
      const rendererSpecs = rendererAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce(
              (prevSet, specs) => {
                return prevSet.addAll(specs);
              },
              ImmutableSet.of<RendererSpec>());

      const onCreateSpecs = onCreateAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce(
              (prevSet, specs) => {
                return prevSet.addAll(specs);
              },
              ImmutableSet.of<OnCreateSpec>());

      baseCustomElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        input: spec.input,
        onCreate: onCreateSpecs,
        renderers: rendererSpecs,
      });
    };
  };
}
