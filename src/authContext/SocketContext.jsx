import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../authContext/UserContext";
import Pusher from "pusher-js";

const SocketContext = createContext(null);
import API_URL, { getHeaders } from "../config";
const BASE_URL = `${API_URL}/users`;

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [pusher, setPusher] = useState(null);
  const [userChannel, setUserChannel] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (pusher) {
        pusher.disconnect();
        setPusher(null);
        setUserChannel(null);
      }
      return;
    }

    // Initialize Pusher if not already done
    let pusherClient = pusher;
    if (!pusherClient) {
      pusherClient = new Pusher("8b4f349c626eb59f3316", {
        cluster: "eu",
        forceTLS: true
      });
      setPusher(pusherClient);
    }

    // Subscribe to private channel for current user
    const channelName = `user-${user._id}`;
    const channel = pusherClient.subscribe(channelName);
    setUserChannel(channel);

    // listen notifications
    channel.bind("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // listen for new messages
    const handleNewMessageCount = () => {
      setUnreadMessageCount((prev) => prev + 1);
    };

    channel.bind("newMessage", handleNewMessageCount);
    channel.bind("message:new", handleNewMessageCount);

    fetchUnreadCount();
    fetchUnreadMessageCount();

      return () => {
        if (pusherClient) {
          channel.unbind("notification:new");
          channel.unbind("newMessage", handleNewMessageCount);
          channel.unbind("message:new", handleNewMessageCount);
          pusherClient.unsubscribe(channelName);
        }
      };
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const NOTIFICATIONS_URL = BASE_URL.replace("/users", "/notifications");
      const res = await fetch(
        `${NOTIFICATIONS_URL}/unread-count`,
        {
          headers: getHeaders(),
          credentials: "include",
        }
      );
      const data = await res.json();
      setUnreadCount(Number(data?.count ?? 0));
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const MESSAGES_URL = BASE_URL.replace("/users", "/messages");
      const res = await fetch(
        `${MESSAGES_URL}/unread-count`,
        {
          headers: getHeaders(),
          credentials: "include",
        }
      );
      const data = await res.json();
      setUnreadMessageCount(Number(data?.count ?? 0));
    } catch (error) {
      console.error("Failed to fetch unread message count:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{ 
        socket: pusher,
        pusher,
        userChannel,
        notifications, 
        unreadCount, 
        unreadMessageCount, 
        setUnreadMessageCount,
        fetchUnreadCount, 
        fetchUnreadMessageCount 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
