import { useEffect, useState, useCallback } from "react";
import GeminiService from "../service/gemini.service";

function checkForMessages() {
    const savedMessages = localStorage.getItem("messages");
    return savedMessages ? JSON.parse(savedMessages) : [];
}

export default function useGemini() {
    const [messages, updateMessage] = useState(() => checkForMessages());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("messages", JSON.stringify(messages));
    }, [messages]);

    const sendMessages = useCallback(async (payload) => {
        updateMessage((prevMessages) => [
            ...prevMessages,
            { role: "model", parts: [{ text: "" }] }
        ]);

        setLoading(true);
        try {
            console.log("Sending message:", payload);
            const stream = await GeminiService.sendMessages(payload.message, payload.history);

            let newMessage = { role: "model", parts: [{ text: "" }] };

            for await (const chunk of stream) {
                const chunkText = chunk.text();
                newMessage.parts[0].text += chunkText;

                updateMessage((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[updatedMessages.length - 1] = newMessage;
                    return updatedMessages;
                });
            }
        } catch (error) {
            console.error("Error occurred:", error);
            updateMessage((prevMessages) => [
                ...prevMessages,
                {
                    role: "model",
                    parts: [{ text: "I'm having trouble connecting to the server. Please try again later." }]
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { messages, loading, sendMessages, updateMessage };
}
