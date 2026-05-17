const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://akvrtwllpeohowsbpgzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdnJ0d2xscGVvaG93c2JwZ3psIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2MTIwNiwiZXhwIjoyMDk0MzM3MjA2fQ.xxlXaMRLyNz4SFV2oAdxgVevLVBWAjYT_X8_bWoCBPE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCities() {
  try {
    const { data: participants, error } = await supabase
      .from('school_participants')
      .select('city')
      .limit(1000);

    if (error) {
      console.error('Error fetching participants:', error);
      return;
    }

    const cities = [...new Set(participants.map(p => p.city))];
    console.log('Unique cities in school_participants table:', cities);
    console.log('Total participants:', participants.length);

    // Let's print a breakdown of city counts
    const counts = {};
    participants.forEach(p => {
      counts[p.city] = (counts[p.city] || 0) + 1;
    });
    console.log('Participants per city:', counts);
  } catch (err) {
    console.error(err);
  }
}

checkCities();
