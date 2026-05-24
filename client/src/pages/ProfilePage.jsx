import { Mail, MessageCircle, RadioTower, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const ProfilePage = () => {
  const { socket, user } = useAuth();

  return (
    <section className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow">Profile</p>
        <div className="mt-5 panel overflow-hidden">
          <div className="relative min-h-52 bg-[radial-gradient(circle_at_20%_20%,rgba(20,243,162,.24),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(91,53,255,.42),transparent_32%),#11103a]" />
          <div className="-mt-16 p-6 sm:p-8">
            <img
              src={user?.avatarlink || "/logo.png"}
              alt=""
              className="relative h-32 w-32 rounded-full border-4 border-ink bg-white object-cover shadow-glow"
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <h1 className="text-4xl font-black">{user?.username}</h1>
                <p className="mt-3 max-w-xl text-white/60">
                  Welcome to your Meetix profile. You're ready to start meeting new people
                  and joining conversations.
                </p>
                <Link to="/lobby" className="btn-primary mt-6 px-6 py-3 text-base">
                  <MessageCircle className="h-5 w-5" />
                  Start chat
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:bg-white/10">
                  <div className="mb-2 flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-mintGlow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">User ID</span>
                  </div>
                  <span className="text-sm font-semibold text-white/90 break-all">{user?.id}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:bg-white/10">
                  <div className="mb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-mintGlow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Email</span>
                  </div>
                  <span className="text-sm font-semibold text-white/90">{user?.email || "Not provided"}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:bg-white/10">
                  <div className="mb-2 flex items-center gap-2">
                    <RadioTower className="h-5 w-5 text-mintGlow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Network Status</span>
                  </div>
                  <span className="text-sm font-semibold text-white/90">{socket?.connected ? "Online & Ready" : "Connecting..."}</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm transition hover:bg-white/10">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-mintGlow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">Account Status</span>
                  </div>
                  <span className="text-sm font-semibold text-white/90">Verified Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
