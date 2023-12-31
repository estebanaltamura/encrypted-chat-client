import { useContext } from "react"
import { PopUpContext } from "../contexts/PopUpContextProvider";
import { PopUp } from "../componentes/popUp/PopUp";
import { LoginForm } from "../componentes/loginForm/LoginForm";
import './Home.css'

export const Home = ()=>{

    const {showPopUp, popUpData} = useContext(PopUpContext)    
   
    return(
      <div className="loginContainer">
        {          
          showPopUp   ?   
            <PopUp  title                       = {popUpData.title}
                    message                     = {popUpData.message}                      
                    type                        = {popUpData.type}
                    seconds                     = {popUpData.seconds}  
                    CTAtext                     = {popUpData.CTAtext}    
                    acceptButtonText            = {popUpData.acceptButtonText}                
                    rejectButtonText            = {popUpData.rejectButtonText}                       
                    handlerAccept               = {popUpData.handlerAccept}
                    handlerReject               = {popUpData.handlerReject}
                    handlerTimeOut              = {popUpData.handlerTimeOut}
            />  
                      :                      
            <LoginForm />                               
        }
      </div>        
    )
}