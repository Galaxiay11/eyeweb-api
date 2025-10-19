import { withCors, json, getSupabaseAdmin, requireAuth } from './_lib.js';

async function handler(req, res){
  const supabase = getSupabaseAdmin();

  if(req.method === 'GET'){
    return requireAuth(async (req2, res2) => {
      const { data, error } = await supabase.from('blocked_ips').select('*').order('created_at', { ascending: false }).limit(200);
      if(error) return json(res2, 500, { error: error.message });
      return json(res2, 200, data);
    })(req, res);
  }

  return json(res, 405, { error: 'method_not_allowed' });
}

export default withCors(handler);
