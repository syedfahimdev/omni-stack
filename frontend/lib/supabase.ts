import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build'

// Create client with a dummy key during build if needed
export const supabase = createClient(supabaseUrl, supabaseKey || 'dummy-key-for-build')
