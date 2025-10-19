import { createClient } from '@supabase/supabase-js';
import { serialize, parse } from 'cookie';
import jwt from 'jsonwebtoken';

const ALLOWED_ORIGINS = [
  'https://eyewebtest.infinityfree.me',
  'http://eyewebtest.infinityfree.me',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost',
];

export function withCors(handler){
  return async (req, res) => {
    const origin = req.headers.origin || '';
    const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    res.setHeader('Access-Control-Allow-Origin', allow);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
    return handler(req, res);
  };
}

export function json(res, status, data){
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function getSupabaseAdmin(){
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

export function setAuthCookie(res, value){
  const cookie = serialize('eyeweb_session', value, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res){
  const cookie = serialize('eyeweb_session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    expires: new Date(0),
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getSessionToken(req){
  const cookies = parse(req.headers.cookie || '');
  return cookies['eyeweb_session'] || null;
}

export function getAuthUser(req){
  const header = req.headers['authorization'] || '';
  const bearer = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim() : null;
  const token = bearer || getSessionToken(req);
  if(!token) return null;
  try{
    const secret = process.env.JWT_SECRET;
    if(!secret) return null;
    const payload = jwt.verify(token, secret);
    return payload || null;
  }catch{
    return null;
  }
}

export function requireAuth(handler){
  return async (req, res) => {
    const user = getAuthUser(req);
    if(!user) return json(res, 401, { error: 'unauthorized' });
    req.user = user;
    return handler(req, res);
  };
}

export function getClientIp(req){
  const xff = req.headers['x-forwarded-for'];
  if(Array.isArray(xff)) return xff[0];
  if(typeof xff === 'string') return xff.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

export async function readBody(req){
  if (req._bodyParsed) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try{
    req.body = raw ? JSON.parse(raw) : {};
  }catch{
    req.body = {};
  }
  req._bodyParsed = true;
  return req.body;
}
