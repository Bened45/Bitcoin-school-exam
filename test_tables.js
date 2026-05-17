require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (!error) console.log(`Table ${tableName} exists! Data:`, data);
  else console.log(`Table ${tableName} error:`, error.message);
}
async function run() {
  await checkTable('schools');
  await checkTable('bitcoin_schools');
  await checkTable('events');
  await checkTable('school_events');
  await checkTable('school_locations');
  await checkTable('locations');
}
run();
