/**
 * Clicks and sign-ups on blocks, sent to Buildbase tracking.
 *
 * @levuche/ui reports what a visitor did on a block with `useBlockActions()`
 * as `{ action, block, label, href }`. Every Levuche site sends those the
 * same way with `sendBlockAction()`:
 *
 * - every action is a goal in Buildbase Analytics, named `block_<action>`
 *   (such as `block_link_click` or `block_buy`), with the block and label;
 * - a sign-up (a form sent on a newsletter, lead magnet or contact block, or
 *   an action named `lead`, `sign_up` or `subscribe`) is also the `lead`
 *   event, which Buildbase maps onto each ad tag's own lead conversion.
 *
 * Kit doesn't import the SDK: pass in `trackGoal` from
 * `@buildbase/sdk/tracking` and `track` from its `useTracking()`.
 *
 *   const { track } = useTracking();
 *   useBlockActions((action) => sendBlockAction(action, { trackGoal, track }));
 *
 * Nothing personal is sent: no field values, and a link's address without
 * its query or fragment, which can carry codes.
 */

/** What @levuche/ui's useBlockActions() reports, as far as tracking reads. */
export interface BlockActionLike {
  action: string;
  block: string | null;
  label: string;
  href?: string;
}

/** Blocks whose form is a sign-up, by their registry id in @levuche/ui. */
export const LEAD_BLOCKS: readonly string[] = [
  'newsletter-band',
  'lead-magnet',
  'contact-form',
];

/** Action names that are a sign-up wherever they are used. */
export const LEAD_ACTIONS: readonly string[] = ['lead', 'sign_up', 'subscribe'];

/** True when the action is someone signing up or getting in touch. */
export function isLeadAction(action: BlockActionLike): boolean {
  if (LEAD_ACTIONS.includes(action.action)) return true;
  return (
    action.action === 'form_submit' &&
    action.block !== null &&
    LEAD_BLOCKS.includes(action.block)
  );
}

/** Buildbase's rule for a goal name: lowercase letters, digits, _ : -, 64 at most. */
function goalName(action: string): string {
  const name = `block_${action.toLowerCase().replace(/[^a-z0-9_:-]+/g, '_')}`;
  return name.slice(0, 64);
}

/** A link's address without its query or fragment, or undefined. */
function plainHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return url.protocol.replace(/:$/, '');
    }
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

/** The properties sent with an action: plain values only. */
export function blockActionProps(
  action: BlockActionLike
): Record<string, string> {
  const props: Record<string, string> = {};
  if (action.block) props.block = action.block;
  if (action.label) props.label = action.label.slice(0, 100);
  const href = plainHref(action.href);
  if (href) props.href = href;
  return props;
}

export interface TrackingSinks {
  /** `trackGoal` from @buildbase/sdk/tracking. */
  trackGoal?: (name: string, props?: Record<string, unknown> | null) => void;
  /** `track` from the SDK's `useTracking()`, for the `lead` event. */
  track?: (name: string, params?: Record<string, unknown>) => void;
}

/**
 * Sends one block action to Buildbase tracking. Never throws: tracking must
 * never break a click.
 */
export function sendBlockAction(
  action: BlockActionLike,
  sinks: TrackingSinks
): void {
  const props = blockActionProps(action);
  try {
    sinks.trackGoal?.(goalName(action.action), props);
    if (isLeadAction(action)) {
      sinks.track?.('lead', {
        ...props,
        method: action.block ?? action.action,
      });
    }
  } catch {
    // A blocked script or a consent refusal is not the visitor's problem.
  }
}
