import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Input } from '../component/input';
import { ElementInput } from '../input/element';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { BaseComponentSpec, InputSpec, OnCreateSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from '../main/component-spec';

interface Spec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Iterable<Input<any>>;
  shadowMode?: 'open'|'closed';
  watch?: Iterable<ResolvedWatchableLocator<any>>;
}

export type BaseCustomElement = (spec: Spec) => ClassDecorator;

export function baseCustomElementFactory(
    inputAnnotationsCache: Annotations<InputSpec>,
    onCreateAnnotationsCache: Annotations<OnCreateSpec>,
    onDomAnnotationsCache: Annotations<OnDomSpec>,
    onKeydownAnnotationsCache: Annotations<OnKeydownSpec>,
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
      const keydownSpecs = onKeydownAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce(
              (prevSet, specs) => {
                return prevSet.addAll(specs);
              },
              ImmutableSet.of<OnKeydownSpec>());
      const listeners = onDomAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce(
              (prevSet, specs) => {
                return prevSet.addAll(specs);
              },
              ImmutableSet.of<OnDomSpec>());

      const onCreateSpecs = onCreateAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce(
              (prevSet, specs) => {
                return prevSet.addAll(specs);
              },
              ImmutableSet.of<OnCreateSpec>());

      const watchers = [
        ...inputAnnotationsCache.forCtor(target)
            .getAttachedValues()
            .values()
            .reduceItem(
                (prevSet, watchers) => {
                  return prevSet.addAll(watchers);
                },
                ImmutableSet.of<ResolvedWatchableLocator<any>>(),
            ),
        ...rendererAnnotationsCache.forCtor(target)
            .getAttachedValues()
            .values()
            .reduceItem(
                (prevSet, spec) => {
                  const set = new Set<ResolvedWatchableLocator<any>>();
                  for (const renderer of spec) {
                    if (renderer.locator) {
                      for (const watcher of renderer.locator.getDependencies()) {
                        set.add(watcher);
                      }
                    }
                  }

                  return prevSet.addAll(ImmutableSet.of(set));
                },
                ImmutableSet.of<ResolvedWatchableLocator<any>>(),
            ),
        ...spec.watch || [],
      ];

      baseCustomElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        input: spec.input,
        keydownSpecs,
        listeners,
        onCreate: onCreateSpecs,
        renderers: rendererSpecs,
        watchers: ImmutableSet.of(watchers),
      });
    };
  };
}