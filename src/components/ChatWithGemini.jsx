import { useEffect, useRef, useState } from "react";
import { Input, Box, InputGroup, InputRightElement, Button, Textarea, Text } from "@chakra-ui/react";
import { DeleteIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import useGemini from "../hooks/useGemini";
import "./Chat.css";

const ChatWithGemini = () => {
    const { messages, loading, sendMessages, updateMessage } = useGemini();
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "en-US";
    
            let finalTranscript = "";
            let resetInput = false;
    
            recognitionRef.current.onresult = (event) => {
                if (resetInput) {
                    finalTranscript = "";  // Reset transcript after sending
                    resetInput = false;
                }
    
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
    
            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };
        } else {
            console.error("Speech Recognition not supported in this browser.");
        }
    
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);    
    

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

    const handleSend = async () => {
        if (!input) return;
    
        const messageToSend = input;  // Save the current input
        setInput('');                // Clear the input field
        updateMessage([...messages, { role: "user", parts: [{ text: messageToSend }] }]);
        sendMessages({ message: messageToSend, history: messages });
    
        // Reset the speech recognition input
        if (recognitionRef.current) {
            recognitionRef.current.onresult = (event) => {
                finalTranscript = "";  // Ensure the input is reset
            };
        }
    
        // Continue listening if it's active
        if (isListening) {
            handleVoiceInput();
        }
    };
    

    const AlwaysScrollToBottom = () => {
        const elementRef = useRef();
        useEffect(() => elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }));
        return <div ref={elementRef} />;
    };

    return (
        <>
            <Box className="w-[100%] self-center max-w-[1400px] m-4 overflow-auto rounded-md h-[80%] items-center">
                <Box className="overflow-auto px-10 py-4 flex flex-col">
                    {messages.length > 0 ? messages.map((message, index) => (
                        <RenderMessage
                            loading={loading}
                            key={index + message.role}
                            messageLength={messages.length}
                            message={message}
                            msgIndex={index}
                        />
                    )) : <Introduction />}
                    <AlwaysScrollToBottom />
                </Box>
            </Box>

            <div>
                <button className="btn" onClick={handleSend}>👨‍🎓 Guide me about studies</button>
                <button className="btn" onClick={handleSend}>🛣️ RoadMap to get Success in Life</button>
                <button className="btn" onClick={handleSend}>🖊️ Provide best career option</button>
            </div>

            <Box className="flex max-w-[1400px] px-10 pt-2 w-[100%] self-center">
                <Box className="flex w-[100%] gap-2 justify-between items-center">
                    <Textarea
                        placeholder="Type a message or use voice input..."
                        value={input || ""}
                        sx={{
                            resize: 'none',
                            padding: '8px 14px 8px 14px',
                            background: 'gray.700',
                            color: 'white',
                            _placeholder: { color: 'white' },
                            h: '1.75rem',
                        }}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        variant={'unstyled'}
                    />
                    <Box className="flex gap-2 flex-col">
                        <Button colorScheme="whatsapp" h="1.75rem" size="sm" onClick={handleSend} rightIcon={<ArrowForwardIcon />}>
                            Send
                        </Button>
                        <Button color="white" _hover={{ bg: "blue.500" }} variant="outline" h="1.75rem" size="sm" onClick={() => updateMessage([])} rightIcon={<DeleteIcon />}>
                            Clear
                        </Button>
                        <Button
                            colorScheme={isListening ? "red" : "blue"}
                            h="1.75rem"
                            size="sm"
                            onClick={handleVoiceInput}
                        >
                            {isListening ? "⏹️ Stop Listening" : "🎤 Voice Input"}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
};

// Remaining components (TextRenderer, Introduction, RenderMessage) stay the same.
const TextRenderer = ({ value = '', direction = 'r', size = 'large' }) => (
    <Text
        fontSize={size}
        bgGradient={`linear(to-${direction}, blue.100, cyan.700)`}
        bgClip="text"
        fontWeight="bold"
    >
        {value}
    </Text>
);

const Introduction = () => (
    <Box className="flex flex-col items-center justify-center">
        <Box className="flex flex-col items-center justify-center">
            <TextRenderer value="Welcome to LifePath Navigator" size="xxx-large" />
            <TextRenderer value="I'm Here, a chatbot that can help you with your queries" direction="l" />
        </Box>
        <Box className="flex flex-col items-center justify-center">
            <TextRenderer value="Type a message to get started" />
        </Box>
    </Box>
);

const RenderMessage = ({ message, msgIndex, loading, messageLength }) => {
    const { parts, role } = message;

    const Loader = () => (
        msgIndex === messageLength - 1 && loading && (
            <Box className="flex self-start pt-2">
                <Box bgColor="blue.500" className="dot" />
                <Box bgColor="blue.500" className="dot" />
                <Box bgColor="blue.500" className="dot" />
            </Box>
        )
    );

    return parts.map((part, index) => (
        part.text ? (
            <Box
                as={motion.div}
                className={`flex overflow-auto max-w-[95%] md:max-w-[96%] w-fit items-end my-2 p-1 px-2 rounded-md ${role === 'user' ? 'self-end' : 'self-start'}`}
                bgColor={role === 'user' ? 'blue.500' : 'gray.200'}
                textColor={role === 'user' ? 'white' : 'black'}
                initial={{ opacity: 0, scale: 0.5, y: 20, x: role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                key={index}
            >
                <ReactMarkdown className="text-sm">{part.text}</ReactMarkdown>
            </Box>
        ) : <Loader key={index} />
    ));
};

export default ChatWithGemini;
