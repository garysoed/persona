import {InputOutput} from './io';

interface InnerSpec {
  readonly [key: string]: InputOutput;
}

export type HostInnerSpec = InnerSpec;

export type InternalInnerSpec = InnerSpec;

export interface Spec<H extends HostInnerSpec, I extends InternalInnerSpec> {
  readonly host?: H;
  readonly internal?: I;
}
