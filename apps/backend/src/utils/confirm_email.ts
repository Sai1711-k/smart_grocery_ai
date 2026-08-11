import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  const user = data.users.find(u => u.email === 'sai17042004@gmail.com');
  if (user) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { 
      email_confirm: true
    });
    
    if (updateError) {
      console.error('Failed to confirm email:', updateError);
    } else {
      console.log('User email confirmed successfully! You can now log in.');
    }
  } else {
    console.log('User not found!');
  }
}

run();
