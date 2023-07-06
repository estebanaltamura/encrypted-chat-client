import { createContext, useRef, useState, useContext, useEffect } from "react"
import { publicKeysContext } from "./publickKeysProvider";
import { chatHistoryContext } from "./ChatHistoryProvider";
import { PopUpContext } from "./PopUpContextProvider";


export const webSocketConnectionContext = createContext(null)

export const WebSocketConnectionContextProvider = ({children})=>{
    const [ connectionstatus, setConnectionStatus ] = useState("offline")
    
    const [ solicitorUserData, setSolicitorUserData ] = useState(null)
    const [ requiredUserData, setRequiredUserData ] = useState(null)    
    const [ requestError, setRequestError ] = useState(null)      
    const { publicKeys, setPublicKeys } = useContext(publicKeysContext) 
    const { chatHistory, setChatHistory} = useContext(chatHistoryContext)
    const socketRef = useRef(null);  
    const publicKeyRef = useRef()
    const connectionStatusRef = useRef()
   

    useEffect(()=>{
        connectionStatusRef.current = connectionstatus
    },[connectionstatus])
    
    useEffect(()=>{
        publicKeyRef.current = publicKeys
    },[publicKeys])

    const handleOpen = () => {
        console.log("connected")        
        setConnectionStatus("online");
    };
    

    const handleMessage = (event) => { 
        const message = event.data; 
        const pardedMessage = JSON.parse(message)  

        //GESTION RECEPCION DE MENSAJES

        //TODOS reflejando su coentenido por console.log
        console.log("mensaje recibido del servidor: ", pardedMessage)

        //Usuario creado por el servidor
        if(pardedMessage.hasOwnProperty("userCreated")){
            setConnectionStatus("userRegistered")
        }   

        //Solicitud de chat de privado
        if(pardedMessage.hasOwnProperty("requestConnection")){           
            const publicKeySolicitorUserData = pardedMessage.requestConnection.userName
            const nickNameSolicitorUserData = pardedMessage.requestConnection.nickName            
            setSolicitorUserData({"publicKey": publicKeySolicitorUserData, "nickName": nickNameSolicitorUserData})
            setConnectionStatus("requestReceived")             
        } 
        
        //Mensaje de chat confirmado
        if(pardedMessage.hasOwnProperty("chatConfirmed")){
            setSolicitorUserData(null)  
            setRequiredUserData(null) 
            const to = pardedMessage.chatConfirmed.to
            const toNickName = pardedMessage.chatConfirmed.toNickName
            setPublicKeys({"from": publicKeyRef.current.from, "to": to, "toNickName": toNickName})
            setConnectionStatus("chating")
            
        } 

        //Mensaje de error
        if(pardedMessage.hasOwnProperty("error")){            
            setSolicitorUserData(null)  
            setRequiredUserData(null)
            
            if(pardedMessage.error === "errorUserDoesntExistOrReject"){
                setRequestError({"title": "Error finding user", "message": "User doesn't exist or rejected your request", "CTA": "Click OK to continue"})
            }
            else if(pardedMessage.error === "errorUserIsTheSame"){
                setRequestError({"title": "User searched  is the same as you", "message": "Enter a valid public key different to your public key", "CTA": "Click OK to continue"})
            }            
            else if(pardedMessage.error === "requesterIsOffline"){
                setRequestError({"title": "Requester is disconnected", "message": "Enter a valid public key of an online user or wait for a request", "CTA": "Click OK to continue"})
            }  
            else if(pardedMessage.error === "canceledRequest" && connectionStatusRef.current === "requestReceived"){
                setRequestError({"title": "Requester cancel the request", "message": "Enter a valid public key of an online user or wait for a request", "CTA": "Click OK to continue"})
            }             
                                   
        } 

        //cierre
        if(pardedMessage.hasOwnProperty("closing")){            
            if(pardedMessage.closing === "otherUserHasClosed"){                
                setConnectionStatus("otherUserHasClosed")
            }                        
        } 

        //Recepcion de mensajes
        if(pardedMessage.hasOwnProperty("sentMessaje")){
            const message = pardedMessage.sentMessaje.message
            console.log(message)
            const now = new Date()
            setChatHistory((chatHistory)=>[{"type": "messageReceived", "message": message, "time": `${String(now.getHours())}:${String(now.getMinutes())}`}, ...chatHistory])            
        }        
    };
    
    const handleClose = async (e) => {  
                   
        console.log("closed")        
        
        if(connectionStatusRef.current === "theUserHasClosed"){
            window.location.href = "/home"            
        }
        else setConnectionStatus("serverError")
        
        console.log(socketRef.current.readyState)
        
        
        socketRef.current = undefined
    }; 
    
    const handleError = async (error) => {                         
        //setConnectionStatus("serverError")
        console.error('Error de conexión:', error);        
    };
    
    const connectWebSocket = () => {
        if (!socketRef.current) {
          socketRef.current = new WebSocket('ws://localhost:4000');          
          socketRef.current.addEventListener('open', handleOpen);
          socketRef.current.addEventListener('message', handleMessage);
          socketRef.current.addEventListener('close', handleClose);
          socketRef.current.addEventListener('error', handleError);
          return true
        }
        return false
    };

    const sendWebSocketMessage = (message) => {        
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            console.log("Envio mensaje", message)
            socketRef.current.send(JSON.stringify(message));
        }
    };
    
    const createUser = (message) => {        
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {            
            socketRef.current.send(JSON.stringify({"createUserData":message}));
        }
    };

    const tryPairing = (publicKeyUser1, publicKeyUser2) => {        
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {    
            socketRef.current.send(JSON.stringify({"tryPairing":{"publicKeyUser1": publicKeyUser1, "publicKeyUser2": publicKeyUser2}}));
            setRequiredUserData({"publicKey": publicKeyUser2})
        }
    };

    const closeConnection = () => {        
        socketRef.current.close()
    }
    
   

    
    
    
    const WebSocketContextValue = {
        connectionstatus,           
        connectWebSocket,
        requestError,
        setRequestError,
        setConnectionStatus,
        sendWebSocketMessage,
        createUser,
        closeConnection,        
        tryPairing,
        solicitorUserData,
        requiredUserData,
        setSolicitorUserData, 
        setRequiredUserData
    }
    
    return(
        <webSocketConnectionContext.Provider value={WebSocketContextValue}>
            {children}
        </webSocketConnectionContext.Provider>
    )   
}