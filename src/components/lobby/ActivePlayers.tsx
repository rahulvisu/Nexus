import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketContext";
import { Clock, Users } from "lucide-react";

const ActivePlayers = () => {
  const { activePlayers, sendGameRequest, isConnected, outgoingRequests } = useSocket();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Connecting to lobby...</p>
        </CardContent>
      </Card>
    );
  }

  if (activePlayers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No other players online right now. Share the app with friends!</p>
        </CardContent>
      </Card>
    );
  }

  const hasPendingRequest = (playerId: string) => {
    return outgoingRequests.some(req => req.to.userId === playerId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Available Players ({activePlayers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activePlayers.map((player) => (
          <div key={player.userId} className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{player.username}</span>
                <Badge variant="secondary" className="text-xs">
                  {player.rating} ELO
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>
            <div>
              {hasPendingRequest(player.userId) ? (
                <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => sendGameRequest(player)}
                >
                  Challenge
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivePlayers;