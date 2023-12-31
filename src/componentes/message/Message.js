import "./Message.css"

export const Message = ({message, type, time})=>{    
  return(
    <div className="messageRow">
      <div className={type === "messageReceived" ? "messageReceivedContainer" : "messageSentContainer"}>   
        <div className={type === "messageReceived" ? "messageContainer messageContainerReceived" : "messageContainer messageContainersent"}>
            <p className="message">{message}</p>
            <span className="timeMessage">{time}</span>      
        </div>             
      </div>
    </div>
  )
}