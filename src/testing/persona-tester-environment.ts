import { Environment } from '@gs-testing';
import { installFakeMutationObserver } from './fake-mutation-observer';

export class PersonaTesterEnvironment implements Environment {
  private uninstallFakeMutationObserver: (() => void)|null = null;

  afterEach(): void {
    if (this.uninstallFakeMutationObserver) {
      this.uninstallFakeMutationObserver();
    }
  }

  beforeEach(): void {
    this.uninstallFakeMutationObserver = installFakeMutationObserver();
  }
}
