import axios from 'axios';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export const generateSpeech = async (text: string, voiceId: string, apiKey?: string) => {
  const key = apiKey || ELEVENLABS_API_KEY;

  if (!key) {
    console.warn('ElevenLabs API key not set. Mocking speech generation.');
    return { status: 'success', audio_url: 'mock-audio-url', message: 'Speech generated (mock)' };
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          'xi-api-key': key,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // Important for audio data
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    throw error;
  }
};
