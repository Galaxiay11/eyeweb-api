import { withCors, json } from './_lib.js';

export default withCors(async (req, res) => {
  return json(res, 200, { ok: true, ts: new Date().toISOString() });
});
