import React, { useState } from "react";
import ChatWithGemini from "./components/ChatWithGemini";
import { Container } from "@chakra-ui/react";
import "./App.css";

function App() {
    const [extractedText, setExtractedText] = useState(""); // Define state for extracted text

    return (
        <Container maxW={"none"} className="App" bgColor={"black"} bgGradient={"linear(to-r, gray.800, blue.700)"} color={"white"}>
        <ChatWithGemini />
        </Container>
    );
}

export default App;
