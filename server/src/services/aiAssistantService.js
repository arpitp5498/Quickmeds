const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `You are a helpful healthcare assistant for QuickMeds. 
You can provide general health information and help users find medicines from our catalog.
Always include this disclaimer when providing health advice: "I am an AI, not a doctor. Please consult a registered medical practitioner for proper medical advice."
You must be polite, concise, and helpful.`;

exports.generateResponse = async (message, conversationHistory, medicines) => {
  try {
    const provider = env.AI_PROVIDER || 'gemini';
    const hasGeminiKey = !!env.GEMINI_API_KEY;
    const hasOpenaiKey = !!env.OPENAI_API_KEY;

    if (!hasGeminiKey && !hasOpenaiKey) {
      return "Hello! I am the QuickMeds AI assistant. It looks like my administrator hasn't configured my AI capabilities yet (missing API keys). Once configured, I can help you with health queries and medicine searches!";
    }

    if (provider === 'gemini' || (hasGeminiKey && !hasOpenaiKey)) {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Grounding data context
      let medicineContext = "Available medicines context:\n";
      if (medicines && medicines.length > 0) {
        medicineContext += medicines.map(m => `- ${m.name} (${m.category}): ₹${m.price}`).join('\n');
      }

      const prompt = `${SYSTEM_PROMPT}\n\n${medicineContext}\n\nUser: ${message}\nAssistant:`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else {
      // Dummy OpenAI implementation fallback or you could import openai
      return "AI Provider configured to OpenAI but not implemented in this demo. Please use Gemini.";
    }
  } catch (error) {
    logger.error('Error generating AI response', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};
