import React, { useState } from "react";

const VoiceToTextChat = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  const handleStartListening = () => {
    setIsListening(true);
    recognition.start();
  };

  const handleStopListening = () => {
    setIsListening(false);
    recognition.stop();
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    setText(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Voice-to-Text Chat</h2>
      <textarea
        rows="4"
        cols="50"
        value={text}
        readOnly
        style={{ margin: "20px 0", fontSize: "16px" }}
      />
      <br />
      {!isListening ? (
        <button onClick={handleStartListening} style={buttonStyle}>
          🎤 Start Listening
        </button>
      ) : (
        <button onClick={handleStopListening} style={buttonStyle}>
          ⏹️ Stop Listening
        </button>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "#4CAF50",
  color: "#fff",
  border: "none",
};

export default VoiceToTextChat;