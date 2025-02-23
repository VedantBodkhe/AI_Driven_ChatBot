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
            const stream = await GeminiService.sendMessages(payload.message, payload.history.slice(-5)); // Keep only last 5 messages

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

    // ✅ New Function for File Upload
    const handleFileUpload = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            console.log("Uploading file:", file);
            const response = await fetch("https://gemini-api.com/upload", {
                method: "POST",
                headers: {
                    Authorization: "Bearer YOUR_GEMINI_API_KEY",
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Upload failed: ${errorData.message}`);
            }

            const data = await response.json();
            console.log("Upload success:", data);

            updateMessage((prevMessages) => [...prevMessages, { role: "bot", parts: [{ text: data.result }] }]);
        } catch (error) {
            console.error("Error uploading file:", error);
            updateMessage((prevMessages) => [...prevMessages, { role: "bot", parts: [{ text: "File processing failed." }] }]);
        } finally {
            setLoading(false);
        }
    };

    return { messages, loading, sendMessages, updateMessage, handleFileUpload };
}
