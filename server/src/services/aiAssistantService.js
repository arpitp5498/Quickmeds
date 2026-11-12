const env = require('../config/env');
const logger = require('../utils/logger');

let GoogleGenerativeAI = null;
const unavailableMessage = 'Chat is currently unavailable. You can still search medicines or book a consultation.';
try {
  ({ GoogleGenerativeAI } = require('@google/generative-ai'));
} catch (e) {
  // @google/generative-ai optional dependency not installed
}

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
      return unavailableMessage;
    }

    if (provider === 'gemini' || (hasGeminiKey && !hasOpenaiKey)) {
      if (!GoogleGenerativeAI) {
        return unavailableMessage;
      }

      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Grounding data context
      let medicineContext = "Catalog entries. Local stock and delivery are checked in the catalog:\n";
      if (medicines && medicines.length > 0) {
        medicineContext += medicines.map(m => `- ${m.name} (${m.category})`).join('\n');
      }

      const prompt = `${SYSTEM_PROMPT}\n\n${medicineContext}\n\nUser: ${message}\nAssistant:`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    } else {
      return unavailableMessage;
    }
  } catch (error) {
    logger.error('Error generating AI response', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};
