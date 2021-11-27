import {Spec} from '../types/ctrl';
import {Registration} from '../types/registration';

export type HtmlRegistration = Pick<Registration<HTMLElement, Spec>, 'spec'>;