
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_KEY, SUPABASE_URL } from '../api'


const supabaseUrl = SUPABASE_URL
const supabaseKey = SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)