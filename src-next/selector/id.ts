import {RenderContext} from '../render/types/render-context';
import {ResolvedBindingSpecProvider, ResolvedProvider, Spec, UnresolvedIO} from '../types/ctrl';
import {IAttr, IClass, IEvent, IFlag, IKeydown, InputOutput, IRect, ITarget, OAttr, OClass, OFlag, OMulti, OSingle, OStyle, OText} from '../types/io';
import {Registration} from '../types/registration';
import {ReversedSpec, reverseSpec} from '../util/reverse-spec';


type RegistrationWithSpec<S extends Spec> = Pick<Registration<HTMLElement, S>, 'spec'>;


function getElement(root: ShadowRoot, id: string): HTMLElement {
  const el = root.getElementById(id);
  if (!el) {
    throw new Error(`Element with ID ${id} cannot be found`);
  }
  return el;
}


export type ExtraUnresolvedBindingSpec = Record<
    string,
    UnresolvedIO<IAttr>|UnresolvedIO<OAttr>|
    UnresolvedIO<IClass>|UnresolvedIO<OClass>|
    UnresolvedIO<IEvent>|
    UnresolvedIO<IFlag>|UnresolvedIO<OFlag>|
    UnresolvedIO<IKeydown>|
    UnresolvedIO<OMulti>|
    UnresolvedIO<IRect>|
    UnresolvedIO<OSingle>|
    UnresolvedIO<OStyle<any>>|
    UnresolvedIO<ITarget>|
    UnresolvedIO<OText>
>;

export function id<S extends Spec>(
    id: string,
    registration: RegistrationWithSpec<S>,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}>>;
export function id<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    id: string,
    registration: RegistrationWithSpec<S>,
    extra: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>
export function id<S extends Spec, X extends ExtraUnresolvedBindingSpec>(
    id: string,
    registration: RegistrationWithSpec<S>,
    extra?: X,
): ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X> {
  const providers: Partial<Record<string, ResolvedProvider<InputOutput>>> = {};
  const reversed = reverseSpec(registration.spec.host ?? {});
  for (const key in reversed) {
    providers[key] = (root: ShadowRoot, context: RenderContext) => reversed[key].resolve(
        getElement(root, id),
        context,
    );
  }

  const normalizedExtra: Record<string, UnresolvedIO<any>> = extra ?? {};
  for (const key in normalizedExtra) {
    providers[key] = (root: ShadowRoot, context: RenderContext) => normalizedExtra[key].resolve(
        getElement(root, id),
        context,
    );
  }
  return providers as unknown as ResolvedBindingSpecProvider<ReversedSpec<S['host']&{}> & X>;
}