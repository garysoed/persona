import {arrayFrom} from 'gs-tools/export/collect';

import {PersonaContext} from '../../export';
import {AttributeInput} from '../input/attribute';
import {HandlerInput} from '../input/handler';
import {HasAttributeInput} from '../input/has-attribute';
import {OnDomInput} from '../input/on-dom';
import {OnInputInput} from '../input/on-input';
import {OnKeydownInput} from '../input/on-keydown';
import {SlottedInput} from '../input/slotted';
import {TextInput} from '../input/text-in';

type SetterFn<T> = (value: T) => void;

export function attributeInputHarness<T>(
    input: AttributeInput<T>,
    context: PersonaContext,
): SetterFn<T|undefined> {
  return value => {
    const targetEl = input.resolver(context);
    if (value === undefined) {
      targetEl.removeAttribute(input.attrName);
      return;
    }

    const result = input.parser.convertForward(value);
    if (!result.success) {
      throw new Error(`Invalid value: ${value}`);
    }
    targetEl.setAttribute(input.attrName, result.result);
  };
}

export function handlerInputHarness(
    input: HandlerInput,
    context: PersonaContext,
): SetterFn<readonly unknown[]> {
  return args => {
    if (!(args instanceof Array)) {
      throw new Error(`Invalid args: ${args}`);
    }
    const el = input.resolver(context);
    (el as any)[input.functionName](...args);
  };
}

export function hasAttributeInputHarness(
    input: HasAttributeInput,
    context: PersonaContext,
): SetterFn<boolean> {
  return value => {
    const targetEl = input.resolver(context);
    if (value) {
      targetEl.setAttribute(input.attrName, '');
    } else {
      targetEl.removeAttribute(input.attrName);
    }
  };
}

export function onDomInputHarness<E extends Event>(
    input: OnDomInput<E>,
    context: PersonaContext,
): SetterFn<E|void> {
  return event => {
    const normalizedEvent = event instanceof Event ? event : new CustomEvent(input.eventName);
    const targetEl = input.resolver(context);
    targetEl.dispatchEvent(normalizedEvent);
  };
}

export function onInputInputHarness(
    input: OnInputInput,
    context: PersonaContext,
): SetterFn<string> {
  return value => {
    const normalizedEvent = new CustomEvent('input');
    const targetEl = input.resolver(context);
    targetEl.value = value;
    targetEl.dispatchEvent(normalizedEvent);
  };
}

export function onKeydownInputHarness(
    input: OnKeydownInput,
    context: PersonaContext,
): SetterFn<void> {
  return () => {
    const targetEl = input.resolver(context);
    const key = input.key;
    const {alt, ctrl, meta, shift} = input.matchOptions;
    const keydownEvent = new KeyboardEvent('keydown', {
      altKey: alt,
      ctrlKey: ctrl,
      key,
      metaKey: meta,
      shiftKey: shift,
    });
    targetEl.dispatchEvent(keydownEvent);
  };
}

export function slottedInputHarness(
    input: SlottedInput,
    context: PersonaContext,
): SetterFn<Element|null> {
  return el => {
    const rootEl = context.shadowRoot.host;
    const slotEl = input.resolver(context);
    if (!el) {
      const children = slotEl.name
        ? arrayFrom(rootEl.querySelectorAll(`[name="${slotEl.name}"]`))
        : arrayFrom(rootEl.children);
      for (const child of children) {
        rootEl.removeChild(child);
      }

      return;
    }

    el.setAttribute('name', slotEl.name);
    rootEl.appendChild(el);
    slotEl.dispatchEvent(new CustomEvent('slotchange'));
  };
}

export function textInputHarness(
    input: TextInput,
    context: PersonaContext,
): SetterFn<string> {
  return value => {
    const el = input.resolver(context);
    el.textContent = value;
    el.dispatchEvent(
        new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record: []}}),
    );
  };
}