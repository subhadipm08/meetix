import { ArrowRight, MessageSquareText, PhoneCall, RadioTower, Search, ShieldCheck, Sparkles, Users, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { usePlatformStats } from "../hooks/usePlatformStats";
import { useAuth } from "../state/AuthContext";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { loading, stats: platformStats } = usePlatformStats();

  const liveStats = [
    {
      label: "Online now",
      value: platformStats.online,
      icon: Users,
    },
    {
      label: "Waiting for match",
      value: platformStats.waiting,
      icon: Search,
    },
    {
      label: "In call",
      value: platformStats.inCall,
      icon: PhoneCall,
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="hero-grid absolute inset-0 opacity-60" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-violetGlow/30 blur-3xl" />
      <div className="absolute right-4 top-64 h-64 w-64 rounded-full bg-mintGlow/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
        <div className="animate-slideUp">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-mintGlow">
            <Sparkles className="h-4 w-4" />
            Real people. Instant rooms. Zero waiting-room clutter.
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
            meetix
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
            Connect instantly with people worldwide. Experience seamless video conversations,
            real-time messaging, and endless new connections in just one click.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={isAuthenticated ? "/lobby" : "/register"} className="btn-primary px-6 py-3 text-base">
              Start matching
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn-secondary px-6 py-3 text-base">
              About project
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {liveStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-lg border border-white/10 bg-ink/70 p-4 shadow-mint backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-white/65">{label}</p>
                  <Icon className="h-5 w-5 text-mintGlow" />
                </div>
                <p className="mt-3 text-3xl font-black text-white">
                  {loading ? "--" : value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px] animate-float">
          <div className="absolute inset-x-8 top-0 h-[420px] rounded-[32px] border border-white/10 bg-[#11103a] shadow-glow" />
          <div className="absolute left-0 top-14 w-[86%] rounded-xl border border-white/10 bg-white/10 p-4 shadow-glow backdrop-blur">
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <div className="relative h-full w-full bg-[radial-gradient(circle_at_30%_30%,rgba(20,243,162,.35),transparent_28%),radial-gradient(circle_at_70%_55%,rgba(91,53,255,.45),transparent_34%),#07091c]">
                <div className="absolute left-5 top-5 rounded-lg bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                  Stranger matched
                </div>
                <Video className="absolute bottom-6 left-6 h-12 w-12 text-white/70" />
                <div className="absolute bottom-8 right-8 h-24 w-24 rounded-full bg-mintGlow/60 blur-xl" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-16 right-0 w-[72%] rounded-xl border border-white/10 bg-ink/90 p-5 shadow-mint backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-mintGlow">
              <MessageSquareText className="h-4 w-4" />
              Text chat synced with video
            </div>
            <div className="space-y-3 text-sm">
              <p className="w-fit rounded-lg bg-white/10 px-3 py-2 text-white/80">Hey, what are you building?</p>
              <p className="ml-auto w-fit rounded-lg bg-violetGlow px-3 py-2 font-semibold text-white">
                Meetix, a realtime chat app.
              </p>
              <p className="w-fit rounded-lg bg-white/10 px-3 py-2 text-white/80">That looks clean.</p>
            </div>
          </div>
          <div className="absolute right-10 top-7 flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
            {isAuthenticated ? <RadioTower className="h-4 w-4 text-mintGlow" /> : <ShieldCheck className="h-4 w-4 text-mintGlow" />}
            {isAuthenticated ? "Live Platform Stats" : "Stats refresh every 10s"}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
