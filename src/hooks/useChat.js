import { useContext } from "react"
import { publicKeysContext } from "../contexts/publickKeysProvider"
import { webSocketConnectionContext } from "../contexts/WebSocketConnectionProvider"
import { chatHistoryContext } from "../contexts/ChatHistoryProvider"

export const useChat = ()=>{

	const { setConnectionStatus, closeConnection, sendWebSocketMessage} = useContext(webSocketConnectionContext)
	const { publicKeys } = useContext(publicKeysContext)
	const { setChatHistory, chatHistory} = useContext(chatHistoryContext)
	
	
	const closeConnectionHandler = ()=>{   
		setConnectionStatus("theUserHasClosed")             
		closeConnection()
	}


	const sendMessageHandler = (e)=>{
		e.preventDefault()        
		let message = e.target.elements.chatInput.value      

		if(message.length > 0){
			message = message[0].toUpperCase() + message.slice(1)    
			const now = new Date()      
			const messageToSend = {"sendMessage": {"from": publicKeys.from, "to": publicKeys.to, "message": message}}
			setChatHistory([{type: "messageSent", "message": message, "time": `${String(now.getHours())}:${String(now.getMinutes())}`}, ...chatHistory])        
			sendWebSocketMessage(messageToSend)
			e.target.elements.chatInput.value = ""
		}        
	}

  return({
		closeConnectionHandler,
		sendMessageHandler
  })
}