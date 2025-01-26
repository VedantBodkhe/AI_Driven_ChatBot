import { GoogleGenerativeAI, } from "@google/generative-ai";
// import { config } from "../utils/config";

const GeminiService = (function () {

    const MODEL_NAME = "gemini-pro";
    // const API_KEY = config.API_KEY;
    const genAI = new GoogleGenerativeAI("AIzaSyCFZ-IJ4ELHjALKkOAEkumsTHEtvYa_Jlc");
    const service = {};

    service.sendMessages = async function (message, prevChat) {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const chat = model.startChat({
            history: prevChat,
        });
        const result = await chat.sendMessageStream(message);
        return result.stream
    }

    return service;
}());

export default GeminiService;
