import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { BaseCustomElement, baseCustomElementFactory } from '../annotation/base-custom-element';
import { CustomElement, customElementFactory } from '../annotation/custom-element';
import { InputAnnotation, inputFactory } from '../annotation/input';
import { OnCreateAnnotation, onCreateFactory } from '../annotation/on-create';
import { Render, renderFactory } from '../annotation/render';
import { BaseComponentSpec, ComponentSpec, OnCreateSpec, RendererSpec } from './component-spec';
import { PersonaBuilder } from './persona-builder';

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  baseCustomElement: BaseCustomElement;
  builder: PersonaBuilder;
  customElement: CustomElement;
  input: InputAnnotation;
  onCreate: OnCreateAnnotation;
  render: Render;
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
  const customElementAnnotationsCache =
      new Annotations<ComponentSpec>(Symbol(`${appName}-component`));
  const baseCustomElementAnnotationsCache =
      new Annotations<BaseComponentSpec>(Symbol(`${appName}-baseComponent`));

  const baseCustomElement = baseCustomElementFactory(
      onCreateAnnotationsCache,
      renderAnnotationsCache,
      baseCustomElementAnnotationsCache,
  );

  const personaBuilder = new PersonaBuilder(
      baseCustomElementAnnotationsCache,
      customElementAnnotationsCache,
  );
  const input = inputFactory(vineApp);
  const newApp = {
    baseCustomElement,
    builder: personaBuilder,
    customElement: customElementFactory(
        customElementAnnotationsCache,
        personaBuilder,
        vineApp,
        baseCustomElement,
    ),
    input,
    onCreate: onCreateFactory(onCreateAnnotationsCache),
    render: renderFactory(renderAnnotationsCache, vineApp.vineIn),
  };
  apps.set(appName, newApp);

  return newApp;
}
