import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../../config";

const GeminiService = (() => {
	const MODEL_NAME = "gemini-2.0-pro-exp-02-05";
	const API_KEY = config.API_KEY;
	const systemInstruction =
		config.AMELIA_PROMPT ||
		"AmeliaAIchatbotAmeliaTeam:SpQtsFeatureSugChatProj:Spanish:WebPage,LandingPage,MobileApp,SDKWebview:HumanPricing:ProjSummaryValidation:StrictProjConvers";
	const genAI = new GoogleGenerativeAI(API_KEY);
	const service = {};

	service.sendMessages = async (message, prevChat) => {
		const model = genAI.getGenerativeModel({
			model: MODEL_NAME,
			systemInstruction,
            safetySettings: [
                {
                    category: 'HARM_CATEGORY_HATE_SPEECH',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
                {
                    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                },
                {
                    category: 'HARM_CATEGORY_HARASSMENT',
                    threshold: 'BLOCK_ONLY_HIGH',
                },
                {
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE',
                },
            ]
		});
		const chat = model.startChat({
			history: prevChat,
		});
		const result = await chat.sendMessageStream(message);
		return result.stream;
	};

	return service;
})();

export default GeminiService;
