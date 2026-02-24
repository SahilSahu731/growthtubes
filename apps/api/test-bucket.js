import 'dotenv/config';
import supabase from './lib/supabase.js';

async function main() {
  const { data, error } = await supabase.storage.getBucket('thumbnails');
  if (error) {
    if (error.message.includes('not found')) {
      console.log('Creating bucket...');
      const { data: bData, error: bError } = await supabase.storage.createBucket('thumbnails', {
        public: true,
      });
      if (bError) console.error(bError);
      else console.log('Created bucket thumbnails');
    } else {
      console.error(error);
    }
  } else {
    console.log('Bucket exists');
  }
}
main();
