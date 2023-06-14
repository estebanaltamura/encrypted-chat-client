import { useRef, useContext, useEffect} from "react"
import { useNavigate } from 'react-router-dom'
import nacl from 'tweetnacl';
import { webSocketConnectionContext } from "../../contexts/WebSocketConnectionProvider";
import { isLoadingContext } from "../../contexts/IsLoadingProvider";
import { publicKeyContext } from "../../contexts/publickKeyProvider";
import Spinner from 'react-bootstrap/Spinner';
import "./Login.css"


export const Login = ()=>{

    const input = useRef()
    const user = useRef()
    const {isLoading, setIsLoading} = useContext(isLoadingContext)    
    const {connectionstatus, connectWebSocket, createUser} = useContext(webSocketConnectionContext)
    const { setPublicKey } = useContext(publicKeyContext) 
    const history = useNavigate()

    useEffect(()=>{
        if(connectionstatus==="offline"){      
            history("/login")          
        }

        if(connectionstatus==="online"){      
            setIsLoading(true)
            createUser(user.current)          
        }

        if(connectionstatus==="userRegistered"){      
            setIsLoading(false)
            setPublicKey(user.current.publicKey)
            history("/findingPair")          
        }
    }     
    ,[connectionstatus])

    const iniciarSesion = (e)=>{
        e.preventDefault()

        if(input.current.value === ""){
            alert("ingresar apodo")
            return           
        } 

        const nickNameInserted = input.current.value
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
                            "state"             : "findingPair",
                            "stateTimeStamp"    : Date.now(),
                            "lastMessageTime"   : null
                        }
        connectWebSocket()      
    }

    
    // COMPORTAMIENTO INPUT
    const onFocusHandler = ()=>{        
        input.current.removeAttribute("placeholder")
    }

    const onBlurHandler = ()=>{        
        input.current.setAttribute("placeholder", "Insert a nick name")
    }
   
    return(
        <>
            {
                isLoading ?
                <Spinner className="spinner" animation="border" />                 
                        :
                <div className="formContainerLogin">
                    <form className="formLogin">
                        <input className="nickNameInput" ref={input} type="text" placeholder="Insert a nick name" autoComplete="off" onFocus={onFocusHandler} onBlur={onBlurHandler}></input>
                        <button className="startSessionButton" onClick={iniciarSesion}>Start session</button>
                    </form>                                        
                </div>
                
            }
        </>        
    )
}