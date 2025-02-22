import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, StopCircle, Trash2 } from "lucide-react";
import gsap from "gsap";

const VoiceToTextChat = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const chatRef = useRef(null);
  const silenceTimer = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText(transcript);
        resetSilenceTimer();
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError("Speech recognition error: " + event.error);
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    gsap.fromTo(chatRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
  }, [text]);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    setError(null);
    setText(""); // Clear previous data before starting
    setIsListening(true);
    recognitionRef.current.start();
    playAudioFeedback("start");
    resetSilenceTimer();
  };

  const handleStopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    recognitionRef.current.stop();
    playAudioFeedback("stop");
    clearTimeout(silenceTimer.current);
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      handleStopListening();
    }, 5000);
  };

  const playAudioFeedback = (type) => {
    const audio = new Audio(type === "start" ? "/start-sound.mp3" : "/stop-sound.mp3");
    audio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 text-transparent bg-clip-text mb-6">
        Voice-to-Text Chat
      </h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <motion.div
        className={`w-32 h-32 mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-110 shadow-lg bg-green-500' : 'bg-gray-700'}`}
        animate={{ opacity: isListening ? 1 : 0.6 }}
      >
        <Mic size={48} color="white" />
      </motion.div>
      <textarea
        rows="4"
        className="w-full max-w-lg p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none"
        value={text}
        readOnly
        ref={chatRef}
      />
      <div className="flex gap-4 mt-4">
        {!isListening ? (
          <motion.button
            onClick={handleStartListening}
            className="p-3 bg-green-500 rounded-full text-white hover:bg-green-400 transition-transform transform hover:scale-110"
          >
            <Mic size={28} />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleStopListening}
            className="p-3 bg-red-500 rounded-full text-white hover:bg-red-400 transition-transform transform hover:scale-110"
          >
            <StopCircle size={28} />
          </motion.button>
        )}
        <motion.button
          onClick={() => setText("")}
          className="p-3 bg-gray-500 rounded-full text-white hover:bg-gray-400 transition-transform transform hover:scale-110"
        >
          <Trash2 size={28} />
        </motion.button>
      </div>
    </div>
  );
};

export default VoiceToTextChat;
