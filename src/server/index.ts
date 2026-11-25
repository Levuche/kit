/**
 * @levuche/kit/server: helpers for server code (route handlers, server
 * components, Workers). Never import this from a client component.
 */
import { assertServer } from './env';

assertServer('@levuche/kit/server');

export { assertServer, readEnv, requireEnv } from './env';
