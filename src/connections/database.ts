// supabaseClient.ts or .js
import { createClient } from '@supabase/supabase-js';
import envVar from '../configs/envVars';

const connectionString = envVar.SUPABASE_URL;
const connectionStringAnonKey = envVar.SUPABASE_ANON_KEY;
if (!connectionString) throw new Error('SUPABASE_URL is not defined');
if (!connectionStringAnonKey)
  throw new Error('SUPABASE_ANON_KEY is not defined');

const supabase = createClient(connectionString, connectionStringAnonKey);

const serviceRoleKey = envVar.SUPABASE_SERVICE_ROLE_KEY;
if (!connectionString) throw new Error('SUPABASE_URL is not defined');
if (!serviceRoleKey)
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');

export const supabaseAdmin = createClient(connectionString, serviceRoleKey);

export default supabase;
