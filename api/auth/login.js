import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withCors, json, getSupabaseAdmin, setAuthCookie, readBody } from '../_lib.js';

export default withCors(async (req, res) => {
  if(req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  const { email, password } = await readBody(req);
  if(!email || !password) return json(res, 400, { error: 'missing_fields' });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('admin_users').select('*').eq('email', email).maybeSingle();
  if(error) return json(res, 500, { error: error.message });
  if(!data) return json(res, 401, { error: 'invalid_credentials' });

  const ok = await bcrypt.compare(password, data.password_hash);
  if(!ok) return json(res, 401, { error: 'invalid_credentials' });

  const secret = process.env.JWT_SECRET;
  if(!secret) return json(res, 500, { error: 'server_not_configured' });
  const token = jwt.sign({ sub: data.id, email: data.email }, secret, { expiresIn: '8h' });
  setAuthCookie(res, token);
  return json(res, 200, { ok: true, token });
});
