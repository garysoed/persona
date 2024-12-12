/**
 * Options for matching keydown event. Each entry has 3 values:
 *
 * -   `true`: REQUIRES the event to have this set.
 * -   `false`: REQUIRES the event to not have this set.
 * -   `undefined`: Ignores this field when matching.
 */
export interface KeyMatchOptions {
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly meta?: boolean;
  readonly shift?: boolean;
}
