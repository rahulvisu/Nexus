import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context/SocketContext";
import { Check, X, Clock } from "lucide-react";

const GameRequests = () => {
  const { incomingRequests, outgoingRequests, acceptGameRequest, declineGameRequest } = useSocket();

  if (incomingRequests.length === 0 && outgoingRequests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {incomingRequests.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Incoming Game Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{request.from.username}</span>
                    <Badge variant="secondary" className="text-xs">
                      {request.from.rating} ELO
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(request.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => acceptGameRequest(request.id)}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineGameRequest(request.id)}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {outgoingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Sent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{request.to.username}</span>
                    <Badge variant="secondary" className="text-xs">
                      {request.to.rating} ELO
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent {new Date(request.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Waiting for response...
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameRequests;