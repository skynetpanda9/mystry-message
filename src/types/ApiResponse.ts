// src/types.ts
export interface Message {
  id: number;
  userId: number;
  content: string;
  createdAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages?: Array<Message>; // Optional relationship to messages
}

// ApiResponse interface
export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
