import ChatWithGemini from './components/ChatWithGemini'
import { Container } from '@chakra-ui/react'

import './App.css'
import VoiceToTextChat from './components/VoiceToTextChat'

function App() {

  return (
    <Container maxW={'none'} className="App" bgColor={'black'} bgGradient={'linear(to-r, gray.800, blue.700)'} color={'black'}>
      <ChatWithGemini />
      {/* <VoiceToTextChat/> */}
    </Container>
  )
}

export default App
