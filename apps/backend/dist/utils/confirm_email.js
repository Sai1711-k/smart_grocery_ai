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
        }
        else {
            console.log('User email confirmed successfully! You can now log in.');
        }
    }
    else {
        console.log('User not found!');
    }
}
run();
