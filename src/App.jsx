import ChatWithGemini from './components/ChatWithGemini'
import { Container } from '@chakra-ui/react'

import './App.css'
import VoiceToTextChat from './components/VoiceToTextChat'

function App() {

  return (
    <Container maxW={'none'} className="App" bgColor={'black'} bgGradient={'linear(to-r, gray.800, blue.700)'} color={'black'}>
<<<<<<< HEAD
    <ChatWithGemini />
=======
      <ChatWithGemini />
      {/* <VoiceToTextChat/> */}
>>>>>>> 594c5d61327668c048e1e8425583a57049d2b94c
    </Container>
  )
}

export default App
