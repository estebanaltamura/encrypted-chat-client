// ** React Imports
import { useState, useEffect, useContext, createContext, useRef } from 'react';

// ** Contexts Imports
import { WebSocketConnectionContext } from './WebSocketConnectionProvider';
import { UsersDataContext } from './UsersDataProvider';

interface IPopUpContextType {
  showPopUp: boolean;
  popUpData: {
    title: string;
    message: string;
    type: string;
    seconds: number;
    acceptButtonText?: string;
    rejectButtonText?: string;
    handlerAccept?: () => void;
    handlerReject?: () => void;
    handlerTimeOut: () => void;
    CTAtext?: string;
  } | null;
  setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setPopUpData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      message: string;
      type: string;
      seconds: number;
      acceptButtonText?: string;
      rejectButtonText?: string;
      handlerAccept?: () => void;
      handlerReject?: () => void;
      handlerTimeOut: () => void;
      CTAtext?: string;
    } | null>
  >;
}

const PopUpContextInitialValue: IPopUpContextType = {
  showPopUp: false,
  popUpData: null,
  setShowPopUp: () => null,
  setPopUpData: () => null,
};
export const PopUpContext = createContext(PopUpContextInitialValue);

export const PopUpContextProvider = ({ children }: { children: React.ReactNode }) => {
  // ** Contexts
  const { connectionStatus, setConnectionStatus, sendWebSocketMessage, requestError, setRequestError } =
    useContext(WebSocketConnectionContext);
  const { usersData, setUsersData } = useContext(UsersDataContext);

  // ** States
  const [showPopUp, setShowPopUp] = useState(false);
  const [popUpData, setPopUpData] = useState<{
    title: string;
    message: string;
    type: string;
    seconds: number;
    acceptButtonText?: string;
    rejectButtonText?: string;
    handlerAccept?: () => void;
    handlerReject?: () => void;
    handlerTimeOut: () => void;
    CTAtext?: string;
  } | null>(null);

  // ** Refs
  const usersDataRef = useRef<{
    fromPublicKey: string | null;
    fromNickName: string | null;
    toPublicKey: string | null;
    toNickName: string | null;
  }>(usersData);

  const connectionStatusRef = useRef<string | null>();
  const requestErrorRef = useRef<{ title: string; message: string; CTA: string } | null>();

  useEffect(() => {
    usersDataRef.current = usersData;
  }, [usersData]);

  useEffect(() => {
    requestErrorRef.current = requestError;
    if (requestErrorRef.current !== null) {
      setConnectionStatus('requestError');
    }
  }, [requestError]);

  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
    console.log(connectionStatusRef.current);

    if (connectionStatus === 'nickNameError') {
      setShowPopUp(true);
      setPopUpData({
        title: 'Nick name error',
        message: 'Nick name should have only alphanumeric characters and at least one character',
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: 'OK',
        handlerAccept: AcceptNickNameErrorHandler,
        handlerTimeOut: timeOutNickNameErrorHandler,
      });
    }

    if (connectionStatus === 'serverError') {
      setShowPopUp(true);
      setPopUpData({
        title: 'Closing',
        message: 'Error interacting with server',
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: 'OK',
        handlerAccept: acceptServerErrorHandler,
        handlerTimeOut: timeOutServerErrorHandler,
      });
    }

    if (connectionStatus === 'disconnectionByInactivity') {
      setShowPopUp(true);
      setPopUpData({
        title: 'The connection is shutting down',
        message: 'Due to inactivity of more than 1 minute, the connection is going to be closed',
        CTAtext: 'If you want to stay connected, please press the button',
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: "I'M HERE",
        handlerAccept: acceptDisconnectionByInactivityHandler,
        handlerTimeOut: timeOutDisconnectionByInactivityHandler,
      });
    }

    if (connectionStatus === 'requestReceived') {
      if (!usersDataRef.current.toNickName) throw new Error('To nick name is undefined');

      const nickNameHandled = usersDataRef.current.toNickName.slice(0, 28) + '...';
      setShowPopUp(true);
      setPopUpData({
        title: 'An user wants talk to you',
        message: `${nickNameHandled} asks you to talk in a private room`,
        CTAtext: `If you want talk with ${nickNameHandled}, please press accept`,
        type: 'twoButtons',
        seconds: 30,
        acceptButtonText: 'START CHAT',
        rejectButtonText: 'REJECT',
        handlerAccept: acceptRequestReceivedHandler,
        handlerReject: rejectRequestReceivedHandler,
        handlerTimeOut: timeOutrequestReceivedHandler,
      });
    }

    if (connectionStatus === 'requestError') {
      if (!requestErrorRef.current) throw new Error('Request error is undefined');
      setShowPopUp(true);
      setPopUpData({
        title: `${requestErrorRef.current.title}`,
        message: `${requestErrorRef.current.message}`,
        CTAtext: `${requestErrorRef.current.CTA}`,
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: 'OK',
        handlerAccept: acceptRequestErrorHandler,
        handlerTimeOut: timeOutRequestErrorHandler,
      });
    }

    if (connectionStatus === 'requestSent') {
      setShowPopUp(true);
      setPopUpData({
        title: 'Request sent',
        message: 'Waiting for response of the other user',
        type: 'oneButtonCancel',
        seconds: 30,
        rejectButtonText: 'CANCEL',
        handlerReject: cancelRequestSentHandler,
        handlerTimeOut: timeOutRequestSentHandler,
      });
    }

    if (connectionStatus === 'userInsertedAnEmptyEntry') {
      setShowPopUp(true);
      setPopUpData({
        title: 'Inserted a empty entry',
        message: 'Please insert a valid public key',
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: 'OK',
        handlerAccept: acceptUserInsertedAnEmptyEntry,
        handlerTimeOut: timeOutUserInsertedAnEmptyEntry,
      });
    }

    if (connectionStatus === 'otherUserHasClosed') {
      setShowPopUp(true);
      setPopUpData({
        title: 'Closing',
        message: 'The other user has close his/her chat',
        type: 'oneButtonAccept',
        seconds: 30,
        acceptButtonText: 'OK',
        handlerAccept: acceptOtherUserHasClosedHandler,
        handlerTimeOut: timeOutOtherUserHasClosedHandler,
      });
    }
  }, [connectionStatus]);

  //INACTIVITY TIME HANDLER
  const acceptDisconnectionByInactivityHandler = () => {
    const path = window.location.pathname;
    const pathInParts = path.split('/');
    const lastPartPath = pathInParts[pathInParts.length - 1];

    if (lastPartPath === 'findingPair') {
      setConnectionStatus('userRegistered');
      setShowPopUp(false);
    } else if (lastPartPath === 'chatRoom') {
      setConnectionStatus('chating');
      setShowPopUp(false);
    }
  };

  const timeOutDisconnectionByInactivityHandler = () => {
    window.location.href = './home';
  };

  //REQUEST ERROR HANDLER
  const acceptRequestErrorHandler = () => {
    setConnectionStatus('userRegistered');
    setRequestError(null);
    setShowPopUp(false);
  };

  const timeOutRequestErrorHandler = () => {
    if (connectionStatusRef.current === 'requestError') {
      setConnectionStatus('userRegistered');
      setRequestError(null);
      setShowPopUp(false);
    }
  };

  //REQUEST SENT
  const cancelRequestSentHandler = () => {
    const cancelRequestSent = {
      cancelRequestSent: {
        user1: usersDataRef.current.fromPublicKey,
        user2: usersDataRef.current.toPublicKey,
      },
    };
    setUsersData({ ...usersData, toPublicKey: null, toNickName: null });
    sendWebSocketMessage(cancelRequestSent);
    setConnectionStatus('userRegistered');
    setShowPopUp(false);
  };

  const timeOutRequestSentHandler = () => {
    if (connectionStatusRef.current === 'requestSent') {
      const cancelRequestSent = {
        cancelRequestSent: {
          user1: usersDataRef.current.fromPublicKey,
          user2: usersDataRef.current.toPublicKey,
        },
      };
      setUsersData({ ...usersData, toPublicKey: null, toNickName: null });
      sendWebSocketMessage(cancelRequestSent);
      setRequestError({
        title: 'Error finding user',
        message: "User doesn't exist or rejected your request",
        CTA: 'Click OK to continue',
      });
      setShowPopUp(false);
    }
  };

  //REQUEST RECEIVED
  const acceptRequestReceivedHandler = () => {
    if (!usersDataRef.current) throw new Error('User data is undefined');
    const confirmedRequest = {
      confirmedRequest: {
        user1: usersDataRef.current.toPublicKey,
        user2: usersDataRef.current.fromPublicKey,
      },
    };
    sendWebSocketMessage(confirmedRequest);
    setShowPopUp(false);
  };

  const rejectRequestReceivedHandler = () => {
    const rejectedRequest = {
      rejectedRequest: {
        user1: usersDataRef.current.toPublicKey,
        user2: usersDataRef.current.fromPublicKey,
      },
    };
    sendWebSocketMessage(rejectedRequest);
    setConnectionStatus('userRegistered');
    setUsersData({ ...usersData, toPublicKey: null, toNickName: null });
    setShowPopUp(false);
  };

  const timeOutrequestReceivedHandler = () => {
    if (connectionStatusRef.current === 'requestReceived') {
      setUsersData({ ...usersData, toPublicKey: null, toNickName: null });
      setConnectionStatus('userRegistered');
      setShowPopUp(false);
    }
  };

  //NICK NAME ERROR
  const AcceptNickNameErrorHandler = () => {
    setConnectionStatus('offline');
    setShowPopUp(false);
  };

  const timeOutNickNameErrorHandler = () => {
    if (connectionStatusRef.current === 'nickNameError') {
      setConnectionStatus('offline');
      setShowPopUp(false);
    }
  };

  //USER INSERTED AN EMPTY ENTRY IN TRY PAIRING PROCESS
  const acceptUserInsertedAnEmptyEntry = () => {
    setConnectionStatus('userRegistered');
    setShowPopUp(false);
  };

  const timeOutUserInsertedAnEmptyEntry = () => {
    if (connectionStatusRef.current === 'userInsertedAnEmptyEntry') {
      setConnectionStatus('userRegistered');
      setShowPopUp(false);
    }
  };

  //SERVER ERROR
  const acceptServerErrorHandler = () => {
    window.location.href = './home';
  };

  const timeOutServerErrorHandler = () => {
    window.location.href = './home';
  };

  //CLOSING BY THE OTHER USER
  const acceptOtherUserHasClosedHandler = () => {
    window.location.href = './home';
  };

  const timeOutOtherUserHasClosedHandler = () => {
    window.location.href = './home';
  };

  return (
    <PopUpContext.Provider value={{ showPopUp, popUpData, setShowPopUp, setPopUpData }}>
      {children}
    </PopUpContext.Provider>
  );
};
