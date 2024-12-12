// Used when MutationObserver isn't good enough to detect mutations, such as
// when inserting a text node.

export const MUTATION_EVENT_NAME = 'ps-mutate';
export class MutationEvent extends Event {
  constructor() {
    super(MUTATION_EVENT_NAME);
  }
}
