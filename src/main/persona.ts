import { InstanceSourceId, InstanceStreamId, NodeId, StaticSourceId } from 'grapevine/export/component';
import { VineApp, VineImpl } from 'grapevine/export/main';
import { ClassAnnotator, ParameterAnnotator, PropertyAnnotator } from 'gs-tools/export/data';
import { Observable, of as observableOf } from 'rxjs';
import { Render, renderFactory } from '../annotation/render';
import { Input } from '../component/input';
import { Output } from '../component/output';
import { CustomElementCtrl } from './custom-element-ctrl';
import { PersonaBuilder } from './persona-builder';


export type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

export interface BaseCustomElementSpec {
  dependencies?: CustomElementCtrlCtor[];
  shadowMode?: 'open'|'closed';
  configure?(vine: VineImpl): void;
}

/**
 * Specs that define a custom element.
 */
export interface CustomElementSpec extends BaseCustomElementSpec {
  tag: string;
  template: string;
}

export interface RendererSpec {
  output: Output<any>;
  propertyKey: string|symbol;
  target: Object;
}

export type InputAnnotator = (input: Input<any>) => ParameterDecorator;

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  builder: PersonaBuilder;
  input: InputAnnotator;
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

  const baseCustomElementAnnotator = new ClassAnnotator(
      (target: Function, spec: BaseCustomElementSpec) => ({
        data: {
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  const customElementAnnotator = new ClassAnnotator(
      (target: Function, spec: CustomElementSpec) => ({
        data: {
          componentClass: target as CustomElementCtrlCtor,
          ...spec,
        },
        newTarget: undefined,
      }),
  );

  const inputAnnotator = new ParameterAnnotator((target, key, index, input: Input<unknown>) => ({
    index,
    input,
    key,
    target,
  }));

  const onCreateAnnotator = new PropertyAnnotator(
      (target: Object, key: string|symbol) =>
          (context: CustomElementCtrl, vine: VineImpl) => vine.run(context, key),
  );

  const renderPropertyAnnotator = new PropertyAnnotator(
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
  const renderWithForwardingAnnotator = new ClassAnnotator(
      (_: Function, output: Output<unknown>, source: NodeId<unknown>|Input<unknown>) => {
        const handler = (
            context: CustomElementCtrl,
            vine: VineImpl,
            root: ShadowRoot,
        ): Observable<unknown> => {
          let obs;
          if (!(source instanceof NodeId)) {
            obs = source.getValue(root);
          } else if (source instanceof InstanceSourceId || source instanceof InstanceStreamId) {
            obs = vine.getObservable(source, context);
          } else if (source instanceof StaticSourceId || source instanceof StaticSourceId) {
            obs = vine.getObservable(source);
          } else {
            throw new Error(`Unhandled node: ${source}`);
          }

          return output.output(root, obs);
        };

        return {
          data: handler,
          newTarget: undefined,
        };
      },
  );

  const personaBuilder = new PersonaBuilder(
      customElementAnnotator,
      inputAnnotator,
      onCreateAnnotator,
      renderPropertyAnnotator,
      renderWithForwardingAnnotator,
      vineApp.vineIn,
  );

  const newApp = {
    baseCustomElement: baseCustomElementAnnotator.decorator,
    builder: personaBuilder,
    customElement: customElementAnnotator.decorator,
    input: inputAnnotator.decorator,
    onCreate: onCreateAnnotator.decorator,
    render: renderFactory(renderPropertyAnnotator, renderWithForwardingAnnotator),
  };
  apps.set(appName, newApp);

  return newApp;
}
