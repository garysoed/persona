import { instanceSourceId } from 'grapevine/export/component';
import { Parser } from 'gs-tools/export/parse';
import { InstanceofType } from 'gs-types/export';
import { ChainedWatcher } from '../watcher/chained-watcher';
import { Watcher } from '../watcher/watcher';
import { ResolvedWatchableLocator } from './resolved-locator';
import { LocatorPathResolver, UnresolvedWatchableLocator } from './unresolved-locator';

interface Input {
  [key: string]: any;
}

type InputParsers<I extends Input> = {[K in keyof I]: Parser<I[K]>};

type TemplateFn<I extends Input> = (input: I) => DocumentFragment|null;


export class ResolvedTemplateLocator<I extends Input> extends
    ResolvedWatchableLocator<TemplateFn<I>> {
  constructor(
      private readonly elementLocator_: ResolvedWatchableLocator<HTMLTemplateElement|null>,
      private readonly parsers_: InputParsers<I>) {
    super(instanceSourceId(`${elementLocator_}.template`, InstanceofType<TemplateFn<I>>(Function)));
  }

  private createTemplateFn_(templateEl: HTMLTemplateElement|null): TemplateFn<I> {
    return (input: Input) => {
      if (!templateEl) {
        return null;
      }

      let innerHTML = templateEl.innerHTML;
      for (const key of Object.keys(input)) {
        const parser = this.parsers_[key];
        innerHTML = innerHTML.replace(key, parser.stringify(input[key]));
      }

      const tempTmpEl = document.createElement('template');
      tempTmpEl.innerHTML = innerHTML;

      return tempTmpEl.content;
    };
  }

  createWatcher(): Watcher<TemplateFn<I>> {
    return new ChainedWatcher(
        this.elementLocator_.createWatcher(),
        (_templateEl, _prevUnlisten, _vine, onChange, root) => {
          onChange(root);

          return null;
        },
        templateEl => this.createTemplateFn_(templateEl));
  }

  getValue(root: ShadowRoot): TemplateFn<I> {
    return this.createTemplateFn_(this.elementLocator_.getValue(root));
  }
}

export class UnresolvedTemplateLocator<I extends Input> extends
    UnresolvedWatchableLocator<TemplateFn<I>> {

  constructor(
      private readonly elementLocator_: UnresolvedWatchableLocator<HTMLTemplateElement|null>,
      private readonly parsers_: InputParsers<I>) {
    super();
  }

  resolve(resolver: LocatorPathResolver): ResolvedTemplateLocator<I> {
    return new ResolvedTemplateLocator(this.elementLocator_.resolve(resolver), this.parsers_);
  }
}

export type TemplateLocator<I extends Input> =
    ResolvedTemplateLocator<I>|UnresolvedTemplateLocator<I>;

export function template<I extends Input>(
    element: UnresolvedWatchableLocator<HTMLTemplateElement|null>,
    parsers: InputParsers<I>): UnresolvedTemplateLocator<I>;
export function template<I extends Input>(
    element: ResolvedWatchableLocator<HTMLTemplateElement|null>,
    parsers: InputParsers<I>): ResolvedTemplateLocator<I>;
export function template<I extends Input>(
    element: UnresolvedWatchableLocator<HTMLTemplateElement|null>|
        ResolvedWatchableLocator<HTMLTemplateElement|null>,
    parsers: InputParsers<I>): TemplateLocator<I> {
  if (element instanceof UnresolvedWatchableLocator) {
    return new UnresolvedTemplateLocator(element, parsers);
  } else {
    return new ResolvedTemplateLocator(element, parsers);
  }
}
