import axios from 'axios';

const TWENTY_API_KEY = process.env.TWENTY_API_KEY;
const TWENTY_API_URL = process.env.TWENTY_API_URL || 'https://api.twenty.com';

export const syncLead = async (leadData: any, apiKey?: string) => {
  const key = apiKey || TWENTY_API_KEY;

  if (!key) {
    console.warn('Twenty CRM API key not set. Mocking lead sync.');
    return { status: 'success', id: 'mock-lead-id', message: 'Lead synced (mock)' };
  }

  try {
    const response = await axios.post(`${TWENTY_API_URL}/leads`, leadData, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error syncing lead to Twenty CRM:', error);
    throw error;
  }
};
