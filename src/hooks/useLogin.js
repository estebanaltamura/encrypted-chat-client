import { useRef, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { webSocketConnectionContext } from "../contexts/WebSocketConnectionProvider"
import nacl from 'tweetnacl';

export const useLogin = ()=>{
    const [ isLoading, setIsLoading ] = useState(false)
    const { connectionStatus, setConnectionStatus, connectWebSocket, createUser } = useContext(webSocketConnectionContext)       
    const user = useRef()      
    const history = useNavigate()

    useEffect(()=>{        
        if(connectionStatus==="online"){                   
            createUser(user.current)          
        }

        if(connectionStatus==="userRegistered"){      
            setIsLoading(false)            
            history("/findingPair")          
        }        

        if(connectionStatus==="serverError"){      
            setIsLoading(false)            
        }        
    }    
    ,[connectionStatus])

    // SET USER
    const setUserData = (inputValue)=>{        
        const nickNameInserted = inputValue
        const regex = /['"]/g;
        const nickNameInsertedHandled = nickNameInserted.replace(regex, "");

        const keyPair = nacl.box.keyPair();
        const publicKey = keyPair.publicKey;
        const privateKey = keyPair.secretKey;

        const publicKeyString = String(publicKey)
        user.current = {
                            "publicKey"         : publicKeyString,
                            "nickName"          : nickNameInsertedHandled,
                            "password"          : null,
                            "to"                : null,
                            "requestStatus"     : null,
                            "stateTimeStamp"    : Date.now(),
                            "lastMessageTime"   : null
                        }        
    }
    
    const startSession = (e)=>{
        e.preventDefault() 
        const inputValue = e.target.elements.nickNameInput.value       
         
        if (inputValue !== ""){
            setUserData(inputValue)
            setIsLoading(true)   
            connectWebSocket()   
        }
        else setConnectionStatus("nickNameError")
    }  

    // INPUT BEHAVIORS
    const onFocusHandler = (e)=>{       
        const element = e.target         
        element.removeAttribute("placeholder")
    }

    const onBlurHandler = (e)=>{    
        const element = e.target        
        element.setAttribute("placeholder", "Insert a nick name")
    }   

    return({
        startSession,
        isLoading,
        onFocusHandler,        
        onBlurHandler
    })
}