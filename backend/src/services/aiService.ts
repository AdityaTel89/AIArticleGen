import axios from 'axios';

export const generateContentWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content from Gemini API');
  }
};

export const generateArticleContent = async (title: string, details: string = ''): Promise<string> => {
  const prompt = `Write a detailed, well-structured programming article titled "${title}". ${details}. Include examples and best practices.`;
  return await generateContentWithGemini(prompt);
};
