/**
 * @levuche/kit: what the Levuche website, app and admin screens share.
 *
 * - `@levuche/kit`: helpers that run anywhere (this file).
 * - `@levuche/kit/server`: helpers for server code only.
 * - `@levuche/kit/theme.css`: the product theme (design tokens --lv-*).
 */
export { brand } from './brand';
export {
  BUILDBASE_DEFAULT_SERVER_URL,
  buildbaseConfig,
  buildbaseEnvironmentId,
  isOrgId,
  type BuildbaseConfig,
  type BuildbaseInput,
} from './buildbase';
export { cn } from './cn';
export { formatPercent, formatPrice } from './format';
export {
  forwardReferral,
  isReferralCode,
  REFERRAL_EVENT,
  REFERRAL_PARAM,
  withReferral,
} from './referral';
export {
  blockActionProps,
  isLeadAction,
  LEAD_ACTIONS,
  LEAD_BLOCKS,
  sendBlockAction,
  type BlockActionLike,
  type TrackingSinks,
} from './tracking';
