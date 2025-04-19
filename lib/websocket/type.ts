enum EventType {
  EVENT_SEND_MESSAGE = "send_message",
  EVENT_NEW_MESSAGE = "new_message",
}

type WSMessageEvent = {
  chat_id: string;
  message: string;
  from: string;
  createAt: string;
};

type WebSocketEvent = {
  type: string;
  payload: WSMessageEvent;
};
