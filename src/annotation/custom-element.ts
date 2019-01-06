import { VineApp } from 'grapevine/export/main';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Input } from '../component/input';
import { ComponentSpec } from '../main/component-spec';
import { PersonaBuilder } from '../main/persona-builder';
import { BaseCustomElement } from './base-custom-element';

/**
 * Specs that define a custom element.
 */
interface Spec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Array<Input<any>>;
  shadowMode?: 'open'|'closed';
  tag: string;
  template: string;
}

export type CustomElement = (spec: Spec) => ClassDecorator;

export function customElementFactory(
    customElementAnnotationsCache: Annotations<ComponentSpec>,
    personaBuilder: PersonaBuilder,
    vineApp: VineApp,
    baseCustomElement: BaseCustomElement,
): CustomElement {
  return (spec: Spec) => {
    return (target: Function) => {
      customElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        componentClass: target as any,
        tag: spec.tag,
        template: spec.template,
      });

      baseCustomElement(spec)(target);

      personaBuilder.register([target as any], vineApp);
    };
  };
}
