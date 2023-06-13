import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

// API_KEY
const API_KEY = "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";

const systemMessage = {
    //  Explain things like you're talking to a software professional with 5 years of experience.
    role: "system",
    content:
    //Explain things about a platform similar to udemy called EduHub that is for students of Cochin University of Science and Technology (CUSAT), made by CUSAT students, for teaching CUSAT students.
        "Speak like a pirate",
};
function App() {
    const [typing, setTyping] = useState(false); // initially false
    const [messages, setMessages] = useState([
        {
            message: "Hello, I am your Support ChatBot! How may I help you?",
            sender: "ChatGPT",
        },
    ]); // []

    const handleSend = async (message) => {
        const newMessage = {
            message: message,
            sender: "user",
            direction: "outgoing",
        };

        const newMessages = [...messages, newMessage]; // Old msgs + new messages
        // message should update our messages state
        setMessages(newMessages);
        // set a typing indicator
        setTyping(true);
        // process msg to ChatGPT(send and see response)
        await processMessageToChatGPT(newMessages); // pass the updated messages para
    };

    async function processMessageToChatGPT(chatMessages) {
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
            return { role: role, content: messageObject.message };
        });

        //role: "system" -> intial message defining HOW we want ChatGPT to talk

        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messsages": [systemMessage, ...apiMessages]
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
            setTyping(false);
        });
    }

    // for className shortcut: div.header + tab
    return (
        <div className="App">
            <div
                style={{
                    position: "relative",
                    height: "800px",
                    width: "700px",
                }}
            >
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={
                                typing ? (
                                    <TypingIndicator content="Support ChatBot is typing" />
                                ) : null
                            }
                        >
                            {messages.map((message, i) => {
                                return <Message key={i} model={message} />;
                            })}
                        </MessageList>
                        <MessageInput
                            placeholder="Type message here"
                            onSend={handleSend}
                        ></MessageInput>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    );
}

export default App;
