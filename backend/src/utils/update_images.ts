import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateImages() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('id, name');
  
  if (error || !products) {
    console.error('Failed to fetch products:', error);
    return;
  }

  console.log(`Updating ${products.length} product images...`);
  let count = 0;
  
  for (const product of products) {
    // Generate a reliable keyword based image url. 
    // We use unsplash via a reliable proxy if possible, or loremflickr
    const query = encodeURIComponent(product.name.toLowerCase().split(' ')[0]);
    const imageUrl = `https://loremflickr.com/400/400/${query},food/all?lock=${count}`;
    
    const { error: updateErr } = await supabase
      .from('products')
      .update({ image_url: imageUrl })
      .eq('id', product.id);

    if (updateErr) {
      console.error(`Failed to update ${product.name}:`, updateErr.message);
    } else {
      count++;
    }
  }

  console.log(`Successfully updated ${count} images!`);
}

updateImages();
