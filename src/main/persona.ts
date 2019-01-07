import { VineApp } from 'grapevine/export/main';
import { Annotations, ClassAnnotation } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { BaseCustomElement, baseCustomElementFactory } from '../annotation/base-custom-element';
import { InputAnnotation, inputFactory } from '../annotation/input';
import { OnCreateAnnotation, onCreateFactory } from '../annotation/on-create';
import { Render, renderFactory } from '../annotation/render';
import { Input } from '../component/input';
import { BaseComponentSpec, OnCreateSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementCtrlCtor, PersonaBuilder } from './persona-builder';

/**
 * Specs that define a custom element.
 */
export interface CustomElementSpec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Array<Input<any>>;
  shadowMode?: 'open'|'closed';
  tag: string;
  template: string;
}

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  baseCustomElement: BaseCustomElement;
  builder: PersonaBuilder;
  input: InputAnnotation;
  onCreate: OnCreateAnnotation;
  render: Render;
  customElement(spec: CustomElementSpec): ClassDecorator;
}

const apps = new Map<string, PersonaApp>();

/**
 * Gets or creates a new Persona app.
 * @param appName Name to register the app with
 * @param vineApp Object representing a Grapevine app.
 */
export function getOrRegisterApp(
    appName: string,
    vineApp: VineApp,
): PersonaApp {
  const createdApp = apps.get(appName);
  if (createdApp) {
    return createdApp;
  }

  const onCreateAnnotationsCache = new Annotations<OnCreateSpec>(Symbol(`${appName}-onCreate`));
  const renderAnnotationsCache = new Annotations<RendererSpec>(Symbol(`${appName}-render`));
  const baseCustomElementAnnotationsCache =
      new Annotations<BaseComponentSpec>(Symbol(`${appName}-baseComponent`));

  const baseCustomElement = baseCustomElementFactory(
      onCreateAnnotationsCache,
      renderAnnotationsCache,
      baseCustomElementAnnotationsCache,
  );

  const customElementAnnotation = new ClassAnnotation(
      (target: Function, spec: CustomElementSpec) => {
        return {
          data: {
            componentClass: target as CustomElementCtrlCtor,
            input: spec.input,
            tag: spec.tag,
            template: spec.template,
          },
          newTarget: undefined,
        };
      },
  );

  const personaBuilder = new PersonaBuilder(
      baseCustomElementAnnotationsCache,
      baseCustomElement,
      customElementAnnotation,
  );
  const input = inputFactory(vineApp);

  const newApp = {
    baseCustomElement,
    builder: personaBuilder,
    customElement: customElementAnnotation.getDecorator(),
    input,
    onCreate: onCreateFactory(onCreateAnnotationsCache),
    render: renderFactory(renderAnnotationsCache, vineApp.vineIn),
  };
  apps.set(appName, newApp);

  return newApp;
}
