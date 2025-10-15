import axios from "axios";
import * as dotenv from "dotenv";

export const getMessages = async (cursor: string | null, convId: string) => {
  const result = await axios.get(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/v1/conversation/messages?convId=${convId}${
      cursor ? `&cursor=${cursor}` : ""
    }`,
    { withCredentials: true }
  );
  return result.data;
};

export const getConversations = async (cursor: string | null) => {
  const result = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/conversation/fetchConversation${
      cursor ? `?cursor=${cursor}` : ""
    }`,
    { withCredentials: true }
  );
  return result.data;
};

export const getUserMessages = async (
  cursor: string | null,
  conversationId: string
) => {
  const result = await axios.get(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/v1/conversation/fetchMessages?conversationId=${conversationId}${
      cursor ? `&cursor=${cursor}` : ""
    }`
  );
  return result.data;
};
