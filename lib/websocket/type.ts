export enum EventType {
  EVENT_SEND_MESSAGE = "send_message",
  EVENT_NEW_MESSAGE = "new_message",
}

export type WSMessageEvent = {
  chat_id: string;
  message: string;
  from: string;
  createAt: string;
};

export type WebSocketEvent = {
  type: EventType;
  payload: WSMessageEvent;
};
