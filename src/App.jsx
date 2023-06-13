import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';  //styling for components
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';  

//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
// New NEw
const API_KEY = "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";

const systemMessage = { 
  "role": "system", 
  // PROMPT 
  //  Explain things like you're talking to a software professional with 5 years of experience.
  //  Explain things about a platform similar to udemy called EduHub that is for students of Cochin University of Science and Technology (CUSAT), made by CUSAT students, for teaching CUSAT students.
  "content": "Explain things like you're talking to a software professional with 2 years of experience."
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your EduHub SupportBot! Ask me anything!",
      sentTime: "Just now",
      sender: "EduHub"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);  // initially false

  // for storing messages in an array
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing', //shows on the RHS
      sender: "user"
    };

    const newMessages = [...messages, newMessage];  // Old msgs + new messages
    // new message should update our messages state
    setMessages(newMessages);
    // Typing indicator
    setIsTyping(true);
    // process msg to ChatGPT(send and see response)
    await processMessageToChatGPT(newMessages);   // pass the updated messages para
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // need to format data from API to frontend.
    // chatMessages has objects = {sender: "user" or "ChatGPT", message: "The message content here"}
    // same as
    // apiMessages { role: "user" or "assistant", content: "The message content here"}
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    //role: "system" -> intial message defining HOW we want ChatGPT to talk

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }


    // for className shortcut: div.header + tab
  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="EduHub SupportBot is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App