import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { API_URL } from "@/lib/api";

type ActivePlayer = {
  userId: string;
  username: string;
  rating: number;
  socketId: string;
};

type GameRequest = {
  id: string;
  from: ActivePlayer;
  to: ActivePlayer;
  timestamp: number;
};

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  activePlayers: ActivePlayer[];
  incomingRequests: GameRequest[];
  outgoingRequests: GameRequest[];
  sendGameRequest: (targetPlayer: ActivePlayer) => void;
  acceptGameRequest: (requestId: string) => void;
  declineGameRequest: (requestId: string) => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<GameRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<GameRequest[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        console.log('🔌 Disconnecting socket due to unauthenticated state');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setActivePlayers([]);
        setIncomingRequests([]);
        setOutgoingRequests([]);
      }
      return;
    }

    // Only create new socket if we don't have one or it's disconnected
    if (!socket || !socket.connected) {
      console.log('🔌 Creating new socket connection to:', API_URL);
      console.log('🔌 Auth data:', { userId: user.id, username: user.email.split('@')[0], rating: user.rating });
      const newSocket = io(API_URL, {
        auth: {
          userId: user.id,
          username: user.email.split('@')[0],
          rating: user.rating,
          token
        },
        timeout: 5000,
        forceNew: true
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        setIsConnected(true);
        // Join lobby and announce presence
        newSocket.emit('lobby:hello', {
          userId: user.id,
          username: user.email.split('@')[0],
          rating: user.rating
        });
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🚫 Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for active players updates
      newSocket.on('lobby:players', (players: ActivePlayer[]) => {
        // Filter out current user
        setActivePlayers(players.filter(p => p.userId !== user.id));
      });

      // Listen for game requests
      newSocket.on('game:request', (request: GameRequest) => {
        setIncomingRequests(prev => [...prev, request]);
        toast({
          title: "Game Request",
          description: `${request.from.username} wants to play a game with you!`
        });
      });

      // Listen for request responses
      newSocket.on('game:request:accepted', (data: { requestId: string; gameId: string }) => {
        setOutgoingRequests(prev => prev.filter(r => r.id !== data.requestId));
        toast({
          title: "Request Accepted!",
          description: "Starting game..."
        });
        // Navigate to game - will be handled by the component
        window.location.href = `/live?gameId=${data.gameId}`;
      });

      newSocket.on('game:request:declined', (data: { requestId: string; by: string }) => {
        setOutgoingRequests(prev => prev.filter(r => r.id !== data.requestId));
        toast({
          title: "Request Declined",
          description: `${data.by} declined your game request.`,
          variant: "destructive"
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user?.id]); // Reduced dependencies to prevent frequent reconnects

  const sendGameRequest = (targetPlayer: ActivePlayer) => {
    if (!socket || !user) return;
    
    const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const request: GameRequest = {
      id: requestId,
      from: {
        userId: user.id,
        username: user.email.split('@')[0],
        rating: user.rating,
        socketId: socket.id || ''
      },
      to: targetPlayer,
      timestamp: Date.now()
    };
    
    setOutgoingRequests(prev => [...prev, request]);
    socket.emit('game:request:send', { request, targetUserId: targetPlayer.userId });
    
    toast({
      title: "Request Sent",
      description: `Game request sent to ${targetPlayer.username}`
    });
  };

  const acceptGameRequest = (requestId: string) => {
    if (!socket) return;
    
    const request = incomingRequests.find(r => r.id === requestId);
    if (!request) return;
    
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    socket.emit('game:request:accept', { requestId });
  };

  const declineGameRequest = (requestId: string) => {
    if (!socket) return;
    
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    socket.emit('game:request:decline', { requestId });
  };

  const value: SocketContextValue = {
    socket,
    isConnected,
    activePlayers,
    incomingRequests,
    outgoingRequests,
    sendGameRequest,
    acceptGameRequest,
    declineGameRequest
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};