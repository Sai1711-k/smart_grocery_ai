"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data } = await supabase.auth.admin.listUsers();
    const user = data.users.find(u => u.email === 'sai17042004@gmail.com');
    if (user) {
        await supabase.auth.admin.updateUserById(user.id, {
            password: 'admin@2005g',
            user_metadata: { role: 'admin', full_name: 'Super Admin' }
        });
        console.log('User password and admin role updated successfully!');
    }
    else {
        console.log('User not found!');
    }
}
run();
