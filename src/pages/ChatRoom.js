import { useContext } from 'react';
import { PopUp } from '../componentes/popUp/PopUp';
import { Chat } from '../componentes/chat/Chat';

export const ChatRoom = () => {
  const { connectionStatus } = useContext(WebSocketConnectionContext);

  if (connectionStatus === 'disconnectionByInactivity' || connectionStatus === 'chating') {
    return <Chat />;
  }
};
