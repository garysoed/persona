import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { Input } from '../component/input';

export type InputAnnotation = (input: Input<any>) => ParameterDecorator;

export function inputFactory(
    vineApp: VineApp,
): InputAnnotation {
  return (input: Input<any>) => {
    return (
        target: Object,
        propertyKey: string | symbol,
        index: number) => {
      vineApp.vineIn(input.id)(target, propertyKey, index);
    };
  };
}
