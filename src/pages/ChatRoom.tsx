// ** React Imports
import { useContext, useEffect, useRef } from 'react';

// ** Icons Imports
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { BsFillCircleFill } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';

// ** Contexts Imports
import { UsersDataContext } from '../contexts/UsersDataProvider';
import { ChatHistoryContext } from '../contexts/ChatHistoryProvider';

// ** Hooks Imports
import { useChat } from '../hooks/useChat';

// ** Component Imports
import { Message } from '../componentes/message/Message';

// ** Material UI Imports
import { Box, Typography, Button } from '@mui/material';

export const ChatRoom: React.FC = () => {
  // ** Contexts
  const { usersData } = useContext(UsersDataContext);
  const { chatHistory } = useContext(ChatHistoryContext);

  // ** Hooks
  const { closeConnectionHandler, sendMessageHandler } = useChat();

  // ** Refs
  const chatMainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMainRef.current) {
      chatMainRef.current.scrollTop = chatMainRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#5C67DB',
      }}
    >
      <Box
        sx={{
          margin: '35px 0 35px 0',
          width: '70%',
          maxWidth: '1700px',
          minHeight: 'calc(100vh - 70px)',
          borderRadius: '5px',
          border: 'none',
          zIndex: '1',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: '60px',
            padding: '7px 8px 7px 18px',
            alignItems: 'center',
            borderTopLeftRadius: '5px',
            borderTopRightRadius: '5px',
            gridTemplateColumns: '1fr 60px',
            backgroundColor: '#EFEFEF',
          }}
        >
          <img src="/avatar.svg" className="avatar" />
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: 'Inter',
              lineHeight: '24px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#353535',
              flexGrow: '1',
            }}
          >
            {usersData.toNickName}
          </Typography>

          <AiOutlineCloseCircle className="closeButtonInHeader" onClick={closeConnectionHandler} />
        </Box>

        <Box
          ref={chatMainRef}
          sx={{
            display: 'flex',
            flexDirection: 'column-reverse',
            justifyContent: 'baseline',
            width: '100%',
            height: 'calc(100vh - 203px)',
            paddingBottom: '18px',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundImage: 'url(/doodle.svg)',
          }}
        >
          {chatHistory.map(
            (element, index) =>
              element.type &&
              element.message &&
              element.time && (
                <Message key={index} type={element.type} message={element.message} time={element.time} />
              ),
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            borderBottomLeftRadius: '5px',
            borderBottomRightRadius: '5px',
            height: '72px',
            flex: '0 0',
            backgroundColor: '#E7E7E5',
          }}
        >
          <form className="formChatSendMessageBar" onSubmit={sendMessageHandler}>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <input
                className="inputChatSendMessageBar"
                placeholder="Escriba un mensaje aquí"
                name="chatInput"
                autoComplete="off"
              ></input>
            </Box>
            <Button sx={{ border: 'none', backgroundColor: '#E7E7E5' }} type="submit">
              <img src="/sendMessageIcon.svg" className="sendMessageIconMessageBar" />
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

// Guard para cuando la persona va atras
