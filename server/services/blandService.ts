import axios from 'axios';

const BLAND_API_KEY = process.env.BLAND_API_KEY;

export const triggerCall = async (phoneNumber: string, agentId: string, task: string, apiKey?: string) => {
  const key = apiKey || BLAND_API_KEY;

  if (!key) {
    console.warn('BLAND_API_KEY is not set. Mocking call trigger.');
    return { status: 'success', call_id: 'mock-call-id', message: 'Call triggered (mock)' };
  }

  try {
    const response = await axios.post('https://api.bland.ai/v1/calls', {
      phone_number: phoneNumber,
      task: task,
      voice_id: agentId === 'sophie' ? '21m00Tcm4TlvDq8ikWAM' : 'AZnzlk1XvdvUeBnXmlld', // Example IDs
      reduce_latency: true,
      wait_for_greeting: true
    }, {
      headers: {
        'authorization': key
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error triggering Bland AI call:', error);
    throw error;
  }
};
