import { Environment } from 'gs-testing';

import { installFakeMutationObserver } from './fake-mutation-observer';

export class PersonaTesterEnvironment extends Environment {
  private uninstallFakeMutationObserver: (() => void)|null = null;

  protected innerAfterEach(): void {
    if (this.uninstallFakeMutationObserver) {
      this.uninstallFakeMutationObserver();
    }
  }

  protected innerBeforeEach(): void {
    this.uninstallFakeMutationObserver = installFakeMutationObserver();
    window.localStorage.clear();
  }
}
