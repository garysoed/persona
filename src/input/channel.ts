import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Type } from 'gs-types/export';
import { Observable, Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class ChannelInput<T> implements Input<T> {
  readonly id: InstanceStreamId<T>;

  constructor(
      readonly channelName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
      type: Type<T>,
  ) {
    this.id = instanceStreamId(`subject(${channelName})`, type);
  }

  getSubject_(el: any): Subject<T> {
    const subject = el[this.channelName] || new Subject();
    if (!(subject instanceof Subject)) {
      throw new Error(`Property ${this.channelName} is not a Subject`);
    }
    el[this.channelName] = subject;

    return subject;
  }

  getValue(root: ShadowRoot): Observable<T> {
    return this.resolver(root)
        .pipe(switchMap(el => this.getSubject_(el)));
  }
}

class UnresolvedChannelInput<T> implements
    UnresolvedElementProperty<Element, ChannelInput<T>> {
  constructor(
      private readonly channelName: string,
      private readonly type: Type<T>,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): ChannelInput<T> {
    return new ChannelInput(this.channelName, resolver, this.type);
  }
}

export function channel<T>(channelName: string, type: Type<T>): UnresolvedChannelInput<T> {
  return new UnresolvedChannelInput(channelName, type);
}
