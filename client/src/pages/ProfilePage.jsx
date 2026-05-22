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
                  Your Meetix session is restored from the access token and used for authenticated
                  Socket.io matching.
                </p>
                <Link to="/lobby" className="btn-primary mt-6 px-6 py-3 text-base">
                  <MessageCircle className="h-5 w-5" />
                  Start chat
                </Link>
              </div>
              <div className="grid gap-3">
                <div className="profile-row">
                  <UserRound className="h-5 w-5 text-mintGlow" />
                  <span>{user?.id}</span>
                </div>
                <div className="profile-row">
                  <Mail className="h-5 w-5 text-mintGlow" />
                  <span>{user?.email || "Email is not present in token"}</span>
                </div>
                <div className="profile-row">
                  <RadioTower className="h-5 w-5 text-mintGlow" />
                  <span>{socket?.connected ? "Socket connected" : "Socket offline"}</span>
                </div>
                <div className="profile-row">
                  <ShieldCheck className="h-5 w-5 text-mintGlow" />
                  <span>Authenticated lobby access</span>
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
