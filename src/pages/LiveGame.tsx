import SiteHeader from "@/components/layout/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameBoard from "@/components/chess/GameBoard";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const LiveGame = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [gameId, setGameId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const gameBoardRef = useRef<any>(null);

  useEffect(() => {
    const gameIdFromUrl = searchParams.get('gameId');
    if (gameIdFromUrl) {
      setGameId(gameIdFromUrl);
      if (socket) {
        socket.emit('game:join', { gameId: gameIdFromUrl });
      }
    }
  }, [searchParams, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleGameJoined = ({ gameId: joinedGameId }: { gameId: string }) => {
      toast({
        title: "Game Joined",
        description: `Connected to game ${joinedGameId}`
      });
    };

    const handleChatMessage = (message: any) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleMove = (data: { move: any }) => {
      // Apply the move to the game board
      if (gameBoardRef.current && data.move) {
        gameBoardRef.current.applyMove(data.move);
      }
    };

    socket.on('game:joined', handleGameJoined);
    socket.on('chat:message', handleChatMessage);
    socket.on('move', handleMove);

    return () => {
      socket.off('game:joined', handleGameJoined);
      socket.off('chat:message', handleChatMessage);
      socket.off('move', handleMove);
    };
  }, [socket]);

  const sendChatMessage = () => {
    if (!socket || !gameId || !chatMessage.trim() || !user) return;
    
    socket.emit('chat:message', {
      gameId,
      message: chatMessage,
      user: { 
        id: user.id,
        username: user.email.split('@')[0]
      }
    });
    
    setChatMessage("");
  };

  const handleMove = (moveData: any) => {
    if (!socket || !gameId) return;
    socket.emit('move', { gameId, move: moveData });
  };

  if (!gameId) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No game ID provided. Please join a game from the lobby.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Game</CardTitle>
              <p className="text-sm text-muted-foreground">Game ID: {gameId}</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <GameBoard ref={gameBoardRef} onMove={handleMove} />
              <div className="text-sm text-muted-foreground">Real-time multiplayer chess game</div>
            </CardContent>
          </Card>
        </section>
        <aside className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Match Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex h-[500px] flex-col gap-3">
              <div className="flex-1 overflow-auto rounded-md border p-3 text-sm space-y-2">
                {chatMessages.length === 0 ? (
                  <p className="text-muted-foreground">No messages yet. Say hello!</p>
                ) : (
                  chatMessages.map((msg) => (
                     <div key={msg.id} className="space-y-1">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span className="font-medium">{msg.user?.username || 'Unknown Player'}</span>
                         <span>•</span>
                         <span>{new Date(msg.at).toLocaleTimeString()}</span>
                       </div>
                       <p className="text-sm">{msg.message}</p>
                     </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Type a message…" 
                  aria-label="Chat message"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button variant="hero" onClick={sendChatMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
};

export default LiveGame;
