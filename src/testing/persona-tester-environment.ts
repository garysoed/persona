import { Environment } from '@gs-testing';
import { installFakeMutationObserver } from './fake-mutation-observer';

export class PersonaTesterEnvironment implements Environment {
  private uninstallFakeMutationObserver: (() => void)|null = null;

  afterEach(): void {
    throw new Error('Method not implemented.');
  }

  beforeEach(): void {
    this.uninstallFakeMutationObserver = installFakeMutationObserver();
  }
}
