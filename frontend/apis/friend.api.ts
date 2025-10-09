import axios from "axios";
import * as dotenv from "dotenv";

export const getUsers = async (id: string | null) => {
  const result = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/getUsers${
      id ? `?cursor=${id}` : ""
    }`,
    { withCredentials: true }
  );
  return result.data;
};

export const addFriend = async ({ IdtoAdd }: { IdtoAdd: string }) => {
  const result = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/addFriend`,
    { IdtoAdd },
    { withCredentials: true }
  );
  return result.data;
};

export const getFriend = async () => {
  const result = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/getFriend`,
    { withCredentials: true }
  );
  return result.data;
};

export const removeFriend = async ({
  IdtobeRemoved,
}: {
  IdtobeRemoved: string;
}) => {
  const result = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/friend/removeFriend`,
    { IdtobeRemoved },
    { withCredentials: true }
  );
  return result.data;
};
