// ** React Imports
import React from 'react';

// ** Material Imports
import { Box, Typography } from '@mui/material';

interface IMessageProps {
  message: string;
  type: string;
  time: string;
}

export const Message: React.FC<IMessageProps> = ({ message, type, time }) => {
  return (
    <Box
      sx={{
        display: 'block',
        width: '100%',
        height: 'fit-content',
        marginTop: '15px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          paddingLeft: type === 'messageReceived' ? '35px' : '',
          paddingRight: type === 'messageSent' ? '35px' : '',
          justifyContent: type === 'messageReceived' ? 'left' : 'right',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: 'fit-content',
            height: 'fit-content',
            padding: '8px 13px',
            boxShadow: '1px 1px 5px 0px rgba(0,0,0,0.75)',
            borderRadius: '10px',
            backgroundColor: type === 'messageReceived' ? '#CECECE' : '#6E65A7',
          }}
        >
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '14px',
              fontFamily: 'Roboto, sans-serif',
              height: 'auto',
              overflowWrap: 'anywhere',
              width: '100%',
              maxWidth: 'min(70vw, 650px)',
              userSelect: 'text',
              textAlign: type === 'messageReceived' ? 'left' : 'right',
              color: type === 'messageReceived' ? '#000000' : '#FFFFFF',
            }}
          >
            {message}
          </Typography>
          <Typography
            sx={{
              height: 'fit-content',
              width: '100%',
              bottom: '1px',
              right: '5px',
              fontSize: '11px',
              color: type === 'messageReceived' ? '#000000' : '#FFFFFF',
              textAlign: type === 'messageReceived' ? 'left' : 'right',
            }}
          >
            {time}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
