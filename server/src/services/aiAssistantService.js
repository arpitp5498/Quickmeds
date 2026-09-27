const env = require('../config/env');
const logger = require('../utils/logger');

let GoogleGenerativeAI = null;
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
      return "Hello! I am the QuickMeds AI assistant. To enable AI consultations, please configure GEMINI_API_KEY in the environment. In the meantime, you can search our medicine catalog directly or consult a registered doctor on our platform.";
    }

    if (provider === 'gemini' || (hasGeminiKey && !hasOpenaiKey)) {
      if (!GoogleGenerativeAI) {
        return "The AI assistant service package is currently not available on this server instance. Please consult a licensed doctor for medical inquiries.";
      }

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
      return "AI Provider configured to OpenAI. Please ensure the provider is configured or use Gemini.";
    }
  } catch (error) {
    logger.error('Error generating AI response', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};
