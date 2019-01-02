import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType } from 'gs-types/export';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class SubjectInput<T> implements Input<Subject<T>> {
  readonly id: InstanceStreamId<Subject<T>>;

  constructor(
      readonly subjectName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`subject(${subjectName})`, InstanceofType<Subject<T>>(Subject));
  }

  getSubject_(el: any): Subject<T> {
    const subject = el[this.subjectName] || new Subject();
    if (!(subject instanceof Subject)) {
      throw new Error(`Property ${this.subjectName} is not a Subject`);
    }
    el[this.subjectName] = subject;

    return subject;
  }

  getValue(root: ShadowRoot): Observable<Subject<T>> {
    return this.resolver(root)
        .pipe(map(el => {
          return this.getSubject_(el);
        }));
  }
}

class UnresolvedSubjectInput<T> implements
    UnresolvedElementProperty<Element, SubjectInput<T>> {
  constructor(private readonly subjectName: string) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): SubjectInput<T> {
    return new SubjectInput(this.subjectName, resolver);
  }
}

export function subject<T>(subjectName: string): UnresolvedSubjectInput<T> {
  return new UnresolvedSubjectInput(subjectName);
}
