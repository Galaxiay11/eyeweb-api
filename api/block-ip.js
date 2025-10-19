import { withCors, json, getSupabaseAdmin, requireAuth, readBody } from './_lib.js';

async function handler(req, res){
  const supabase = getSupabaseAdmin();

  if(req.method === 'POST'){
    return requireAuth(async (req2, res2) => {
      const { ip, reason } = await readBody(req2);
      if(!ip) return json(res2, 400, { error: 'missing_ip' });
      // normalize ip/cidr
      const ip_cidr = ip.includes('/') ? ip : `${ip}/32`;
      const { data, error } = await supabase.from('blocked_ips').insert({ ip_cidr, reason: reason || '' }).select('*').single();
      if(error) return json(res2, 500, { error: error.message });
      return json(res2, 201, data);
    })(req, res);
  }

  return json(res, 405, { error: 'method_not_allowed' });
}

export default withCors(handler);
