const aiAssistantService = require('../services/aiAssistantService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Medicine = require('../models/Medicine');

exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      throw ApiError.badRequest('Message is required');
    }

    // Get a few popular medicines as context for grounding
    const medicines = await Medicine.find().limit(50).select('name category price description');

    const response = await aiAssistantService.generateResponse(message, conversationHistory, medicines);

    return ApiResponse.success(res, { response });
  } catch (error) {
    next(error);
  }
};
