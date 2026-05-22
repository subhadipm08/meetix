import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import { login as apiLogin, logout as apiLogout, refreshAccessToken } from "../services/api";
import { clearTokens, getAccessToken, userFromToken } from "../utils/token";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id,
    avatarlink: user.avatarlink || user.avatar,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [booting, setBooting] = useState(true);
  const { pushToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const boot = async () => {
      const token = getAccessToken();
      if (token) {
        const tokenUser = normalizeUser(userFromToken(token));
        if (tokenUser) {
          setUser(tokenUser);
          setBooting(false);
          return;
        }
      }

      try {
        const refreshed = await refreshAccessToken();
        if (active && refreshed?.user) {
          setUser(normalizeUser(refreshed.user));
        }
      } catch {
        clearTokens();
      } finally {
        if (active) setBooting(false);
      }
    };

    boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setSocket((current) => {
        current?.disconnect();
        return null;
      });
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const nextSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    nextSocket.on("connect", () => {
      pushToast(`Connected as ${user.username}`, "success");
    });

    nextSocket.on("connect_error", (error) => {
      pushToast(error.message || "Socket connection failed", "error");
    });

    nextSocket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        pushToast("Realtime connection lost. Reconnecting when possible.", "error");
      }
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
    };
  }, [pushToast, user]);

  const signIn = useCallback(
    async (credentials) => {
      const data = await apiLogin(credentials);
      setUser(normalizeUser(data.user));
      pushToast("Welcome back to Meetix.", "success");
      navigate("/");
      return data;
    },
    [navigate, pushToast],
  );

  const completeOtpLogin = useCallback(
    (data) => {
      setUser(normalizeUser(data.user));
      pushToast("Account verified. You are in.", "success");
      navigate("/");
    },
    [navigate, pushToast],
  );

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
    pushToast("Signed out.", "info");
    navigate("/");
  }, [navigate, pushToast]);

  const value = useMemo(
    () => ({
      booting,
      completeOtpLogin,
      isAuthenticated: Boolean(user),
      setUser,
      signIn,
      signOut,
      socket,
      user,
    }),
    [booting, completeOtpLogin, signIn, signOut, socket, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
