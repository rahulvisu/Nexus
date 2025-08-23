import SiteHeader from "@/components/layout/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Chessboard, { Piece } from "@/components/chess/Chessboard";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { LogOut, Trophy, Calendar, Target, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";

type DbGame = {
  _id: string;
  players: string[];
  status: "live" | "finished" | "aborted";
  result: "1-0" | "0-1" | "1/2-1/2" | "ongoing";
  moves: { from: string; to: string; san?: string; fen: string; time: string }[];
  createdAt: string;
  updatedAt: string;
};

const fenToMatrix = (fen: string): Piece[][] => {
  const c = new Chess(fen);
  return c.board().map((row) => row.map((p) => (p ? { type: p.type, color: p.color } : null)) as Piece[]);
};

const Dashboard = () => {
  const { isAuthenticated, token, user, logout } = useAuth();
  const [games, setGames] = useState<DbGame[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully");
  };

  useEffect(() => {
    let abort = false;
    async function load() {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/games/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to fetch history");
        const data = await res.json();
        if (!abort) setGames(data.games || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, [isAuthenticated, token]);

  const currentRating = user?.rating ?? 1200;
  const displayUsername = user?.email ? user.email.split('@')[0] : '';
  const joinDate = user ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const wins = games.filter(g => g.result === "1-0").length;
  const losses = games.filter(g => g.result === "0-1").length;
  const draws = games.filter(g => g.result === "1/2-1/2").length;
  const totalGames = wins + losses + draws;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="h-6 w-6" />
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Please sign in to view your dashboard</p>
                <Button asChild>
                  <a href="/auth">Sign In</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-subtle rounded-lg p-6 mb-8 border">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                {displayUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{displayUsername}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Member
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {joinDate}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {totalGames} games played
                </div>
              </div>
            </div>

            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Current Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{currentRating}</div>
              <p className="text-xs text-muted-foreground mt-1">Starting rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Games Played</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalGames}</div>
              <p className="text-xs text-muted-foreground mt-1">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">{wins}W • {losses}L • {draws}D</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalGames > 0 ? Math.round(((wins * 1 + draws * 0.5) / totalGames) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Score percentage</p>
            </CardContent>
          </Card>
        </div>

        {/* Game History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Game History
                {totalGames > 0 && (
                  <Badge variant="secondary">{totalGames}</Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {!loading && games.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No games yet</p>
                <p className="text-muted-foreground mb-6">Play vs AI and finish a game to see it here</p>
                <Button asChild>
                  <a href="/ai">Play Your First Game</a>
                </Button>
              </div>
            )}

            {!loading && games.length > 0 && (
              <div className="space-y-4">
                {games.slice(0, 6).map((game, index) => {
                  const lastFen = game.moves?.length ? game.moves[game.moves.length - 1].fen : new Chess().fen();
                  const matrix = fenToMatrix(lastFen);
                  const isWin = game.result === "1-0";
                  const isLoss = game.result === "0-1";
                  const isDraw = game.result === "1/2-1/2";
                  
                  return (
                    <div key={game._id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <Chessboard board={matrix} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={isWin ? "default" : isLoss ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {game.result === "ongoing" ? "In Progress" : 
                               isWin ? "Victory" : isLoss ? "Defeat" : "Draw"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              vs AI • {game.moves?.length || 0} moves
                            </span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {new Date(game.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {games.length > 6 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {Math.min(6, games.length)} of {games.length} games
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

