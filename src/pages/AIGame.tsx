import SiteHeader from "@/components/layout/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GameBoard from "@/components/chess/GameBoard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

const AIGame = () => {
  const [key, setKey] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Create an AI game on mount if logged in
  useEffect(() => {
    let aborted = false;
    async function startGame() {
      if (!isAuthenticated) {
        setGameId(null);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/games/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to start AI game");
        const data = await res.json();
        if (!aborted) setGameId(data.game._id);
      } catch (e: any) {
        toast.error(e?.message || "Could not create AI game. You can still play locally.");
      }
    }
    startGame();
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isAuthenticated]);

  const persistMove = async (m: { from: string; to: string; san?: string; fen: string }) => {
    if (!gameId || !token) return;
    try {
      await fetch(`${API_URL}/api/games/${gameId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(m),
      });
    } catch (e) {
      // quiet fail
    }
  };

  const finish = async (result: "1-0" | "0-1" | "1/2-1/2") => {
    if (!gameId || !token) return;
    try {
      await fetch(`${API_URL}/api/games/${gameId}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ result }),
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Play vs Stockfish</h1>
          <p className="text-muted-foreground">
            {isAuthenticated ? "Your moves will be saved to your history." : "No login required. Login to save your games."}
          </p>
        </header>
        <section className="flex flex-col items-center gap-6">
          <GameBoard
            key={key}
            vsAI
            onMove={(m) => persistMove(m)}
            onGameOver={(r) => finish(r)}
          />
          <Button variant="hero" onClick={() => { setKey((k) => k + 1); setGameId(null); }}>Start New Game</Button>
        </section>
      </main>
    </div>
  );
};

export default AIGame;
