import { withCors, json, getSupabaseAdmin, getClientIp, requireAuth, readBody } from './_lib.js';

async function handler(req, res){
  const supabase = getSupabaseAdmin();

  if(req.method === 'POST'){
    const ip = getClientIp(req);
    const body = await readBody(req);

    // Check blocked IPs
    if(ip){
      const { data: blocked } = await supabase.rpc('is_ip_blocked', { ip_input: ip });
      if(blocked === true){
        return json(res, 403, { error: 'ip_blocked' });
      }
    }

    const payload = {
      event: body.event || 'event',
      path: body.path || null,
      referrer: body.referrer || null,
      user_agent: body.userAgent || req.headers['user-agent'] || null,
      language: body.language || null,
      timezone: body.timezone || null,
      connection: body.connection || null,
      ip: ip || null,
      ip_masked: body.ip_masked || null
    };
    const { data, error } = await supabase.from('logs').insert(payload).select('*').single();
    if(error) return json(res, 500, { error: error.message });
    return json(res, 201, data);
  }

  if(req.method === 'GET'){
    // Protected: require auth to list logs
    return requireAuth(async (req2, res2) => {
      const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(200);
      if(error) return json(res2, 500, { error: error.message });
      return json(res2, 200, data);
    })(req, res);
  }

  return json(res, 405, { error: 'method_not_allowed' });
}

export default withCors(handler);
