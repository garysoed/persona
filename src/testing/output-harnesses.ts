import {stringify, Verbosity} from 'moirai';
import {fromEvent, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import {ShadowContext} from '../core/shadow-context';
import {AttributeOutput} from '../output/attribute';
import {ClassToggleOutput} from '../output/class-toggle';
import {DispatcherOutput} from '../output/dispatcher';
import {SetAttributeOutput} from '../output/set-attribute';
import {StyleOutput} from '../output/style';
import {TextOutput} from '../output/text-out';
import {Resolver} from '../types/resolver';
import {attributeObservable} from '../util/attribute-observable';
import {mutationObservable} from '../util/mutation-observable';


export function attributeOutputHarness<T>(
    output: AttributeOutput<T>,
    context: ShadowContext,
): Observable<T> {
  const targetEl = output.resolver(context);
  return attributeObservable(targetEl, output.attrName).pipe(
      map(() => {
        const strValue = targetEl.getAttribute(output.attrName);
        const value = output.parser.convertBackward(strValue || '');
        if (!value.success) {
          if (output.defaultValue !== undefined) {
            return output.defaultValue;
          }

          throw new Error(
              `Value ${stringify(strValue, Verbosity.DEBUG)} is the wrong type for `
              + `${stringify(output, Verbosity.DEBUG)}`,
          );
        }

        return value.result;
      }),
  );
}

export function classToggleOutputHarness(
    output: ClassToggleOutput,
    context: ShadowContext,
): Observable<boolean> {
  return classlistOutputHarness(output, context).pipe(
      map(classes => classes.has(output.className)),
  );
}

interface ClasslistOutputLite {
  readonly resolver: Resolver<Element>;
}

export function classlistOutputHarness(
    output: ClasslistOutputLite,
    context: ShadowContext,
): Observable<ReadonlySet<string>> {
  const el = output.resolver(context);
  return attributeObservable(el, 'class').pipe(
      map(() => {
        const classList = el.classList;
        const classes = new Set<string>();
        for (let i = 0; i < classList.length; i++) {
          const classItem = classList.item(i);
          if (!classItem) {
            continue;
          }
          classes.add(classItem);
        }
        return new Set(classes);
      }),
  );
}

export function dispatcherOutputHarness<E extends Event>(
    output: DispatcherOutput<E>,
    context: ShadowContext,
): Observable<E> {
  const element = output.resolver(context);
  return fromEvent<E>(element, output.eventName);
}

export function setAttributeOutputHarness(
    output: SetAttributeOutput,
    context: ShadowContext,
): Observable<boolean> {
  const targetEl = output.resolver(context);
  return attributeObservable(targetEl, output.attrName).pipe(
      map(() => targetEl.hasAttribute(output.attrName)),
  );
}

export function styleOutputHarness<K extends keyof CSSStyleDeclaration>(
    output: StyleOutput<K>,
    context: ShadowContext,
): Observable<CSSStyleDeclaration[K]> {
  const el = output.resolver(context);
  return attributeObservable(el, 'style').pipe(
      map(() => el.style[output.styleKey]),
  );
}

export function textOutputHarness(
    output: TextOutput,
    context: ShadowContext,
): Observable<string> {
  const el = output.resolver(context);
  return mutationObservable(el, {characterData: true}).pipe(
      startWith({}),
      map(() => el.textContent ?? ''),
  );
}