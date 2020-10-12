import { Environment } from 'gs-testing';

import { installFakeMutationObserver } from './fake-mutation-observer';
import { installFakeResizeObserver } from './fake-resize-observer';

export class PersonaTesterEnvironment extends Environment {
  private uninstallFakeMutationObserver: (() => void)|null = null;
  private uninstallFakeResizeObserver: (() => void)|null = null;

  protected innerAfterEach(): void {
    if (this.uninstallFakeMutationObserver) {
      this.uninstallFakeMutationObserver();
    }

    if (this.uninstallFakeResizeObserver) {
      this.uninstallFakeResizeObserver();
    }
  }

  protected innerBeforeEach(): void {
    this.uninstallFakeMutationObserver = installFakeMutationObserver();
    this.uninstallFakeResizeObserver = installFakeResizeObserver();
    window.localStorage.clear();
  }
}
