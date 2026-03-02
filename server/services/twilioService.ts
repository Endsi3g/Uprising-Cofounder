import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let client: any;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export const sendSMS = async (to: string, body: string, accountSid?: string, authToken?: string, fromNumber?: string) => {
  const sid = accountSid || TWILIO_ACCOUNT_SID;
  const token = authToken || TWILIO_AUTH_TOKEN;
  const from = fromNumber || TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.warn('Twilio credentials not set. Mocking SMS send.');
    return { status: 'success', sid: 'mock-sms-sid', message: 'SMS sent (mock)' };
  }

  const twilioClient = twilio(sid, token);

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: from,
      to: to
    });
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};
