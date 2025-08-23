import SiteHeader from "@/components/layout/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocket } from "@/context/SocketContext";
import ActivePlayers from "@/components/lobby/ActivePlayers";
import GameRequests from "@/components/lobby/GameRequests";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

const Home = () => {
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Live Lobby</h1>
              <p className="text-muted-foreground">Challenge other players to a game</p>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </header>
        
        <div className="space-y-6">
          <GameRequests />
          
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivePlayers />
            
            <Card>
              <CardHeader>
                <CardTitle>Live Games</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon: watch ongoing games and spectate matches.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
