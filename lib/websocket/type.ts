export enum EventType {
  EVENT_SEND_MESSAGE = "send_message",
  EVENT_NEW_MESSAGE = "new_message",
  EVENT_NEW_USER = "new_user",
  EVENT_LEAVE_USER = "leave_user",
  EVENT_NEW_GROUP = "new_group"
}

export type WSMessageEvent = {
  chat_id: string;
  message: string;
  from: string;
  createAt: string;
};

export type NewUserStatusEvent = {
  user_id: string;
}

export type NewGroupEvent = {
  chat_id: string;
}

export type WebSocketEvent = {
  type: EventType;
  payload: WSMessageEvent | NewUserStatusEvent | NewGroupEvent;
};
