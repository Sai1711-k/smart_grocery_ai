import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data } = await supabase.auth.admin.listUsers();
  const user = data.users.find(u => u.email === 'sai17042004@gmail.com');
  if (user) {
    await supabase.auth.admin.updateUserById(user.id, { 
      password: 'admin@2005g',
      user_metadata: { role: 'admin', full_name: 'Super Admin' } 
    });
    console.log('User password and admin role updated successfully!');
  } else {
    console.log('User not found!');
  }
}
run();
