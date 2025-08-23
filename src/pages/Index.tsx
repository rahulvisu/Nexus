import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/SiteHeader";
import { Link } from "react-router-dom";
import { Cpu, Users, Sword, MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SiteHeader />
      <main
        className="pointer-gradient"
        onMouseMove={(e) => {
          const x = (e.clientX / window.innerWidth) * 100;
          const y = (e.clientY / window.innerHeight) * 100;
          (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
          (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
        }}
      >
        <section className="container mx-auto flex flex-col items-center gap-10 px-4 py-24 text-center">
          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Play Chess Online — 1v1 Matches and AI vs Stockfish
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Instant games, real-time chat, and beautiful analytics. No sign-up needed to battle our AI—create an account to track ratings and history.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="hero">
              <Link to="/ai">Play vs AI</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/home">Find an Opponent</Link>
            </Button>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sword, title: "Ranked 1v1", desc: "Matchmaking by rating for fair games." },
              { icon: Cpu, title: "Stockfish AI", desc: "Blazing-fast .wasm engine in your browser." },
              { icon: Users, title: "Live Lobby", desc: "See active games and available players." },
              { icon: MessageSquare, title: "Realtime Chat", desc: "Text + emoji during live matches." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border bg-card p-6 text-left shadow-sm transition-transform hover:scale-[1.02]">
                <Icon className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mb-1 text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
