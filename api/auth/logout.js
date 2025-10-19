import { withCors, json, clearAuthCookie } from '../_lib.js';

export default withCors(async (req, res) => {
  if(req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  clearAuthCookie(res);
  return json(res, 200, { ok: true });
});
