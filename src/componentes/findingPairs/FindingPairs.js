import { useRef, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { webSocketConnectionContext } from "../../contexts/WebSocketConnectionProvider";
import { publicKeysContext } from "../../contexts/publickKeysProvider";
import { lastActivityTimeContext } from "../../contexts/LastActivityTimeProvider";
import { AiOutlineCloseCircle, AiOutlineCopy } from "react-icons/ai";
import { usePopUpHandler } from '../../hooks/usePopUpHandler';
import { PopUp } from '../popUp/PopUp';


import "./FindingPairs.css"

export const FindingPairs = ()=>{
    const { connectionstatus, setConnectionStatus, closeConnection, tryPairing, solicitorUserData, sendWebSocketMessage, requestError } = useContext(webSocketConnectionContext)
    const { setSecondsFromLastActivity } = useContext(lastActivityTimeContext)
    const { publicKeys } = useContext(publicKeysContext)     
    const input = useRef() 
    
    
    
    const requestErrorRef = useRef()
    const publicKeysRef = useRef()
    const [isLoading, setIsLoading] = useState(false)
    const [requesterNickName, setRequesterNickName] = useState() 
    const [copyPublicKeyText, setCopyPublicKeyText] = useState("Copy my public key")   

    const { acceptDisconnectionByInactivityHandler,
            timeOutDisconnectionByInactivityHandler,
            acceptRequestReceivedHandler,
            rejectRequestReceivedHandler,
            timeOutrequestReceivedHandler,
            acceptRequestErrorHandler,
            timeOutRequestErrorHandler,
            cancelRequestSentHandler,
            timeOutRequestSentHandler,
            acceptServerErrorClosingHandler,
            timeOutServerErrorClosingHandler,
            acceptUserInsertedAnEmptyEntry,
            timeOutUserInsertedAnEmptyEntry
            } = usePopUpHandler()

    const history = useNavigate()
    

    const closeConnectionHandler = ()=>{        
        closeConnection()
    }


    

   
    useEffect(()=>{
        if(connectionstatus==="offline") window.location.href = "/login"  
        
        if(connectionstatus==="chating"){
            history("/chatRoom") 
            //setIsLoading(false)
        }

        // if(connectionstatus==="requestError"){
        //     setIsLoading(false)
        // }        
    }     
    ,[connectionstatus])



    useEffect(()=>{
        
        
        if(solicitorUserData !== null){
            if(solicitorUserData.nickName !== null){
                if(solicitorUserData.nickName.length < 18){
                    setRequesterNickName(solicitorUserData.nickName)
                } 
                else{
                    const nickNameHandled = solicitorUserData.nickName.slice(0,18) + "..."
                    setRequesterNickName(nickNameHandled)
                }               
            }            
        }        
    }     
    ,[solicitorUserData])

    useEffect(()=>{
        requestErrorRef.current = requestError
        if(requestErrorRef.current !== null){
            setConnectionStatus("requestError")
        }        
    }     
    ,[requestError])


    useEffect(()=>{
        publicKeysRef.current = publicKeys
    }     
    ,[publicKeys])

    

    const tryPairingHandler = (e)=>{
        e.preventDefault()
        const publicKeyUser2 = input.current.value
        setConnectionStatus("requestSent")                
        tryPairing(publicKeys.from, publicKeyUser2)        
    }    

    

    const copyToClipboard = async () => {       
        await navigator.clipboard.writeText(publicKeysRef.current.from);  
        setCopyPublicKeyText("Copied!")
        const timeOut = setTimeout(()=>{
            setCopyPublicKeyText("Copy my public key")
            clearTimeout(timeOut)
        },1500)
        
    };

  
    // COMPORTAMIENTO INPUT
    const onFocusHandler = ()=>{          
        input.current.removeAttribute("placeholder")
    }

    const onBlurHandler = ()=>{        
        input.current.setAttribute("placeholder", "Insert a public key of your peer")
    }


    // contexto popUp con useEffect escucha connectionStatus, Si se dispara algun estado que dispara un popUp, isPopUp true
    // popUp data se exporta segun el estado de connectionStatus que los dispara un objeto con los datos correspondiente a ese popup
    // Por ejemplo el estado disconnectionByInactivity dispara:
    //     isPopUp = True popUpData =   {   "title"         :"The connection is shutting down" 
    //                                      "message        :"Due to inactivity of more than 1 minute, the connection is going to be closed"
    //                                      "CTAtext"       :If you want to stay connected, please press the button"
    //                                      "type"          :oneButtonAccept" 
    //                                      "seconds"       :{10}
    //                                      "button2Text"   :"I'M HERE"
    //                                      "handlerAccept" :{acceptDisconnectionByInactivityHandler}
    //                                      "handlerTimeOut":{timeOutDisconnectionByInactivityHandler}   }
    // Las funciones se incluyen en el contexto del popUp                         
    return(
        <>
            {
                connectionstatus === "disconnectionByInactivity" 
                    ?                
                    <PopUp  title="The connection is shutting down" 
                            message="Due to inactivity of more than 1 minute, the connection is going to be closed"
                            CTAtext="If you want to stay connected, please press the button"
                            type="oneButtonAccept" 
                            seconds={10}
                            button2Text="I'M HERE"
                            handlerAccept={acceptDisconnectionByInactivityHandler}
                            handlerTimeOut={timeOutDisconnectionByInactivityHandler}
                            key={connectionstatus}
                    />                                             
                    :
                connectionstatus === "requestReceived" 
                    ?   
                    <PopUp  title="An user wants talk to you" 
                            message={`${requesterNickName} asks you to talk in a private room`}
                            CTAtext={`If you want talk with ${requesterNickName}, please press accept`}
                            type="twoButton" 
                            seconds={20}
                            button1Text="REJECT"
                            button2Text="START CHAT"
                            handlerReject={rejectRequestReceivedHandler}
                            handlerAccept={acceptRequestReceivedHandler}
                            handlerTimeOut={timeOutrequestReceivedHandler}

                            key={connectionstatus}
                    />   
                    :
                connectionstatus === "requestError"
                    ?   
                    <PopUp  title={`${requestErrorRef.current.title}`}
                            message={`${requestErrorRef.current.message}`}
                            CTAtext={`${requestErrorRef.current.CTA}`}
                            type="oneButtonAccept" 
                            seconds={10}                            
                            button2Text="OK"
                            handlerAccept={acceptRequestErrorHandler}
                            handlerTimeOut={timeOutRequestErrorHandler}
                            key={connectionstatus}
                    />   
                    :
                connectionstatus === "serverError" // ver
                    ?   
                    <PopUp  title="Closing"  
                            message="Error interacting with server"                      
                            type="oneButtonAccept" 
                            seconds={10}                            
                            button2Text="OK"
                            handlerAccept={acceptServerErrorClosingHandler}
                            handlerTimeOut={timeOutServerErrorClosingHandler}
                            key={connectionstatus}
                    />   
                    :    
                connectionstatus === "requestSent"
                    ?   
                    <PopUp  title="Request sent"  
                            message="Waiting for response of user"                      
                            type="oneButtonCancel" 
                            seconds={20}                            
                            button2Text="CANCEL"
                            handlerAccept={cancelRequestSentHandler}
                            handlerTimeOut={timeOutRequestSentHandler}
                            key={connectionstatus}
                    />   
                    :     
                connectionstatus === "userInsertedAnEmptyEntry"
                    ?   
                    <PopUp  title="Inserted a empty entry"  
                            message="Please insert a valid public key"                      
                            type="oneButtonAccept" 
                            seconds={10}                            
                            button2Text="OK"
                            handlerAccept={acceptUserInsertedAnEmptyEntry}
                            handlerTimeOut={timeOutUserInsertedAnEmptyEntry}
                            key={connectionstatus}
                    />
                    :                     
                        <>  <div className="closeButtonContainerFindingPair">
                                <AiOutlineCloseCircle className="closeConnectionButtonFindingPair" onClick={closeConnectionHandler}/>
                            </div>                  
                            
                            <div className="findingPairContainer">

                                <div className="logoContainer">
                                    <img className="logoImage" src="https://i.postimg.cc/bNy9QWtG/logo.jpg"/>
                                </div>
                                
                                <div className="tutorialMessageContainerFindingPair">
                                    <p className="tutorialMessageFindingPair">Share your public key by whatsapp or similar with the person you want and wait for his invitation</p>
                                    <p className="tutorialMessageFindingPair or">or</p>
                                    <p className="tutorialMessageFindingPair">Insert the public key which you received of the person who you want have a private talk and send his an invitation</p>
                                </div>   
                                
                                <div className="formContainerFindingPair">                    
                                    <form className="formFindingPair" onSubmit={tryPairingHandler}>
                                        <input className="nickNameInputFindingPair" ref={input} type="text" placeholder="Insert a public key of your peer" autoComplete="off" onFocus={onFocusHandler} onBlur={onBlurHandler}></input>
                                        <button className="startSessionButtonFindingPair" onClick={tryPairingHandler}>Start chat</button>
                                        <div className="copyPublicKeyContainer" onClick={copyToClipboard}><AiOutlineCopy className="copyIcon" /><p className="copyPublicKeyText">{copyPublicKeyText}</p></div>
                                    </form>                                        
                                </div>

                            </div>
                        </>
            }
        </>            
    )
}


