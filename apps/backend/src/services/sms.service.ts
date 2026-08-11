/**
 * SMS Service — Sends real OTP to Indian mobile numbers via Fast2SMS / Twilio
 * 
 * Fast2SMS: Free 25 credits for testing (https://www.fast2sms.com)
 * Twilio:   $15 free trial credit (https://www.twilio.com)
 */

// ── Helper: fetch with timeout ──
const fetchWithTimeout = async (url: string, options: any, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export class SmsService {

  /**
   * Send OTP via SMS to an Indian mobile number.
   * Tries Fast2SMS first, then Twilio as fallback.
   */
  static async sendOtp(phone: string, otp: string): Promise<void> {
    // Clean phone number — remove +91 prefix, spaces, dashes
    const cleanPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '').slice(-10);

    if (cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
      throw new Error(`Invalid Indian mobile number: ${phone}`);
    }

    const fast2smsKey = process.env.FAST2SMS_API_KEY?.replace(/^["']|["']$/g, '').trim();
    const twilioSid   = process.env.TWILIO_ACCOUNT_SID?.replace(/^["']|["']$/g, '').trim();
    const twilioToken = process.env.TWILIO_AUTH_TOKEN?.replace(/^["']|["']$/g, '').trim();
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER?.replace(/^["']|["']$/g, '').trim();

    const errors: string[] = [];

    // ── 1. Fast2SMS (DLT Route — India) ──
    if (fast2smsKey) {
      try {
        console.log(`[SMS] Attempting Fast2SMS → +91 ${cleanPhone}`);
        const r = await fetchWithTimeout('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone,
            flash: 0,
          }),
        });

        const data = await r.json();
        if (r.ok && data.return === true) {
          console.log(`[SMS] ✅ Fast2SMS successfully sent OTP to +91 ${cleanPhone}`);
          return;
        }
        const msg = `Fast2SMS returned: ${JSON.stringify(data)}`;
        console.error(`[SMS] ⚠️ ${msg}`);
        errors.push(msg);
      } catch (err: any) {
        const msg = `Fast2SMS exception: ${err.message}`;
        console.error(`[SMS] ⚠️ ${msg}`);
        errors.push(msg);
      }
    }

    // ── 2. Twilio (International Fallback) ──
    if (twilioSid && twilioToken && twilioPhone) {
      try {
        console.log(`[SMS] Attempting Twilio → +91${cleanPhone}`);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');

        const body = new URLSearchParams({
          To: `+91${cleanPhone}`,
          From: twilioPhone,
          Body: `Your Smart Grocery AI verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        });

        const r = await fetchWithTimeout(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        if (r.ok || r.status === 201) {
          console.log(`[SMS] ✅ Twilio successfully sent OTP to +91${cleanPhone}`);
          return;
        }
        const errTxt = await r.text();
        const msg = `Twilio returned ${r.status}: ${errTxt}`;
        console.error(`[SMS] ⚠️ ${msg}`);
        errors.push(msg);
      } catch (err: any) {
        const msg = `Twilio exception: ${err.message}`;
        console.error(`[SMS] ⚠️ ${msg}`);
        errors.push(msg);
      }
    }

    // ── 3. All providers failed ──
    if (errors.length > 0) {
      throw new Error(`SMS delivery failed. Errors: ${errors.join(' | ')}`);
    }

    throw new Error(
      'No SMS provider configured. Add FAST2SMS_API_KEY or TWILIO credentials to .env'
    );
  }
}
