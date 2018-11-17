import { VineApp } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedRenderableWatchableLocator, ResolvedWatchableLocator, ResolvedWatchableLocators } from '../locator/resolved-locator';
import { ComponentSpec, InputSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from '../main/component-spec';
import { PersonaBuilder } from '../main/persona-builder';

/**
 * Specs that define a custom element.
 */
interface Spec {
  dependencies?: (typeof BaseDisposable)[];
  shadowMode?: 'open'|'closed';
  tag: string;
  template: string;
  watch?: Iterable<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>;
}

export type CustomElement = (spec: Spec) => ClassDecorator;

export function customElementFactory(
    inputAnnotationsCache: Annotations<InputSpec>,
    onDomAnnotationsCache: Annotations<OnDomSpec>,
    onKeydownAnnotationsCache: Annotations<OnKeydownSpec>,
    rendererAnnotationsCache: Annotations<RendererSpec>,
    customElementAnnotationsCache: Annotations<ComponentSpec>,
    personaBuilder: PersonaBuilder,
    vineApp: VineApp): CustomElement {
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

      const watchers = [
        ...inputAnnotationsCache.forCtor(target)
            .getAttachedValues()
            .values()
            .reduceItem(
                (prevSet, watchers) => {
                  return prevSet.addAll(watchers);
                },
                ImmutableSet.of<ResolvedWatchableLocators>(),
            ),
        ...rendererAnnotationsCache.forCtor(target)
            .getAttachedValues()
            .values()
            .reduceItem(
                (prevSet, spec) => {
                  const set = new Set<ResolvedWatchableLocators>();
                  for (const renderer of spec) {
                    for (const watcher of renderer.locator.getDependencies()) {
                      set.add(watcher);
                    }
                  }

                  return prevSet.addAll(ImmutableSet.of(set));
                },
                ImmutableSet.of<ResolvedWatchableLocators>(),
            ),
        ...spec.watch || [],
      ];

      customElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        componentClass: target as any,
        keydownSpecs,
        listeners,
        renderers: rendererSpecs,
        tag: spec.tag,
        template: spec.template,
        watchers: ImmutableSet.of(watchers),
      });

      personaBuilder.register([target as any], vineApp);
    };
  };
}
