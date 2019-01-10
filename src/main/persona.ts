import { InstanceSourceId, InstanceStreamId, NodeId, StaticSourceId } from 'grapevine/export/component';
import { VineApp, VineImpl } from 'grapevine/export/main';
import { ClassAnnotation, PropertyAnnotation } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Observable, of as observableOf } from 'rxjs';
import { InputAnnotation, inputFactory } from '../annotation/input';
import { Render, renderFactory } from '../annotation/render';
import { Input } from '../component/input';
import { Output } from '../component/output';
import { BaseComponentSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementCtrlCtor, PersonaBuilder } from './persona-builder';

export interface BaseCustomElementSpec {
  dependencies?: Array<typeof BaseDisposable>;
  input?: Array<Input<any>>;
  shadowMode?: 'open'|'closed';
}

/**
 * Specs that define a custom element.
 */
export interface CustomElementSpec extends BaseComponentSpec {
  tag: string;
  template: string;
}

export interface RendererSpec {
  output: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  builder: PersonaBuilder;
  input: InputAnnotation;
  render: Render;
  baseCustomElement(spec: BaseCustomElementSpec): ClassDecorator;
  customElement(spec: CustomElementSpec): ClassDecorator;
  onCreate(): PropertyDecorator;
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

  const baseCustomElementAnnotation = new ClassAnnotation(
      (target: Function, spec: BaseCustomElementSpec) => ({
        data: {
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  const customElementAnnotation = new ClassAnnotation(
      (target: Function, spec: CustomElementSpec) => ({
        data: {
          componentClass: target as CustomElementCtrlCtor,
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  const onCreateAnnotation = new PropertyAnnotation(
      (target: Object, key: string|symbol) =>
          (context: CustomElementCtrl, vine: VineImpl) => {
            return vine.run(context, key);
          },
  );

  const renderPropertyAnnotation = new PropertyAnnotation(
      (target: Object, key: string|symbol, output: Output<unknown>) =>
          (context: CustomElementCtrl, vine: VineImpl, root: ShadowRoot) => {
            const property = (context as any)[key];
            let obs;
            if (typeof property === 'function') {
              obs = vine.run(context, key);
            } else if (property instanceof Observable) {
              obs = property;
            } else {
              obs = observableOf(property);
            }

            return output.output(root, obs);
          },
  );
  const renderWithForwardingAnnotation = new ClassAnnotation(
      (target: Function, output: Output<unknown>, sourceId: NodeId<unknown>) => ({
        data(context: CustomElementCtrl, vine: VineImpl, root: ShadowRoot): Observable<unknown> {
          let obs;
          if (sourceId instanceof InstanceSourceId || sourceId instanceof InstanceStreamId) {
            obs = vine.getObservable(sourceId, context);
          } else if (sourceId instanceof StaticSourceId || sourceId instanceof StaticSourceId) {
            obs = vine.getObservable(sourceId);
          } else {
            throw new Error(`Unhandled node: ${sourceId}`);
          }

          return output.output(root, obs);
        },
        newTarget: undefined,
      }),
  );

  const personaBuilder = new PersonaBuilder(
      baseCustomElementAnnotation,
      customElementAnnotation,
      onCreateAnnotation,
      renderPropertyAnnotation,
      renderWithForwardingAnnotation,
  );
  const input = inputFactory(vineApp);

  const newApp = {
    baseCustomElement: baseCustomElementAnnotation.getDecorator(),
    builder: personaBuilder,
    customElement: customElementAnnotation.getDecorator(),
    input,
    onCreate: onCreateAnnotation.getDecorator(),
    render: renderFactory(renderPropertyAnnotation, renderWithForwardingAnnotation),
  };
  apps.set(appName, newApp);

  return newApp;
}
