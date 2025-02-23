import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Textarea } from "@chakra-ui/react";
import { ArrowUpCircle, Mic, Trash2, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import useGemini from "../hooks/useGemini";

const ChatWithGemini = () => {
    const { messages, loading, sendMessages, updateMessage } = useGemini();
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const chatRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = "";  // Reset final transcript on each recognition event
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                setInput(finalTranscript + interimTranscript);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
        }
        return () => recognitionRef.current?.stop();
    }, []);

    useEffect(() => {
        gsap.fromTo(chatRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
    }, [messages]);

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleVoiceInput = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const messageToSend = input.trim();
        setInput("");
        updateMessage([...messages, { role: "user", parts: [{ text: messageToSend }] }]);
        sendMessages({ message: messageToSend, history: messages });
        if (isListening) handleVoiceInput();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            updateMessage([...messages, { role: "user", parts: [{ text: `Uploaded file: ${file.name}` }] }]);
            sendMessages({ message: fileContent, history: messages });
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col items-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
            <motion.div className="w-full max-w-3xl h-[75vh] overflow-y-auto bg-gray-800 rounded-lg p-4 shadow-xl"
                ref={chatRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}>
                {messages.length > 0 ? messages.map((message, index) => (
                    <RenderMessage key={index} message={message} />
                )) : <Introduction />}
                {loading && <TypingIndicator />}
            </motion.div>

            <motion.div className="flex items-center w-full max-w-3xl mt-4 p-3 bg-gray-700 rounded-lg relative shadow-lg"
                whileHover={{ scale: 1.02 }}>
                <Textarea
                    placeholder="Type a message or use voice input..."
                    value={input}
                    className="w-full p-3 bg-transparent text-white placeholder-gray-400 focus:outline-none border border-gray-600 rounded-lg transition-all"
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <motion.button onClick={handleSend} className="ml-2 text-blue-500 hover:text-blue-400 transition transform hover:scale-125">
                    <ArrowUpCircle size={28} />
                </motion.button>
                <motion.button onClick={handleVoiceInput} className={`ml-2 transition transform hover:scale-125 ${isListening ? "text-red-500 animate-pulse" : "text-green-400"}`}>
                    <Mic size={28} />
                </motion.button>
                <motion.button onClick={() => updateMessage([])} className="ml-2 text-gray-400 hover:text-gray-300 transition transform hover:scale-125">
                    <Trash2 size={24} />
                </motion.button>
                <motion.label className="ml-2 text-purple-400 hover:text-purple-300 transition transform hover:scale-125 cursor-pointer">
                    <Upload size={24} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                </motion.label>
            </motion.div>
        </div>
    );
};

const RenderMessage = ({ message }) => (
    message.parts.map((part, index) => (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 my-2 max-w-xs rounded-lg shadow-md text-white ${message.role === "user" ? "bg-blue-500 self-end ml-auto" : "bg-gray-600 self-start"}`}
            whileHover={{ scale: 1.05 }}>
            <ReactMarkdown>{part.text}</ReactMarkdown>
        </motion.div>
    ))
);

const TypingIndicator = () => (
    <motion.div className="flex space-x-2 mt-2" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
    </motion.div>
);

const Introduction = () => (
    <div className="flex flex-col items-center justify-center text-center py-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 text-transparent bg-clip-text">
            Welcome to MindSync AI
        </h2>
        <p className="text-gray-400 mt-2">An NLP-Powered Conversational Assistant with Real-Time Intelligence</p>
        <p className="text-gray-500 mt-1">Type a message to get started.</p>
    </div>
);

export default ChatWithGemini;
