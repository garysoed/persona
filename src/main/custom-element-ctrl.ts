import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';

export abstract class CustomElementCtrl extends BaseDisposable {
  abstract init(vine: VineImpl): any;
}
