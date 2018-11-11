// import { VineImpl } from 'grapevine/export/main';
// import { assert, match, retryUntil, should } from 'gs-testing/export/main';
// import { createSpy, createSpyInstance, resetCalls, SpyObj } from 'gs-testing/export/spy';
// import { ElementWatcher } from './element-watcher';

// describe('watcher.ElementWatcher', () => {
//   let shadowRoot: ShadowRoot;
//   let mockVine: SpyObj<VineImpl>;

//   beforeEach(() => {
//     const rootEl = document.createElement('div');
//     shadowRoot = rootEl.attachShadow({mode: 'closed'});
//     mockVine = createSpyInstance(VineImpl);
//   });

//   describe('getValue_', () => {
//     should(`return the correct value`, () => {
//       const el = document.createElement('div');
//       shadowRoot.appendChild(el);

//       const watcher = new ElementWatcher<HTMLDivElement|null>(root => root.querySelector('div'));
//       assert(watcher.getValue(shadowRoot)).to.equal(el);
//     });
//   });

//   describe('startWatching_', () => {
//     should(`update the source if the element has changed`, async () => {
//       const watcher = new ElementWatcher<HTMLDivElement|null>(root => root.querySelector('div'));

//       const mockOnChange = createSpy('OnChange');

//       const disposableFn = watcher['startWatching_'](mockVine, mockOnChange, shadowRoot);
//       assert(mockOnChange).to.haveBeenCalledWith(shadowRoot);

//       resetCalls(mockOnChange);

//       const el = document.createElement('div');
//       shadowRoot.appendChild(el);

//       await retryUntil(() => mockOnChange).to
//           .equal(match.anySpyThat().haveBeenCalledWith(shadowRoot));
//       disposableFn.dispose();
//     });
//   });
// });
