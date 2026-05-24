import { Mail, ShieldCheck, Heart, Users, UserRound } from "lucide-react";
import { CONTACT_EMAIL, GITHUB_PROFILE } from "../config";
import GithubIcon from "../components/GithubIcon";

const techCards = [
  ["WebRTC", "low-latency video"],
  ["Socket.io", "matching and chat"],
  ["JWT", "secure sessions"],
];

const details = [
  { icon: Users, title: "Connect Globally", body: "Meet people from around the world instantly with just one click. No waiting rooms, just connections." },
  { icon: Heart, title: "Friendly Community", body: "We prioritize a safe, welcoming, and fun environment for all our users. Be kind and respectful." },
  { icon: ShieldCheck, title: "Secure Platform", body: "Your privacy matters. Our platform uses state-of-the-art security to keep your interactions safe." },
];

const AboutPage = () => (
  <section className="relative min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
    <div className="hero-grid absolute inset-0 opacity-35" />
    <div className="relative mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="eyebrow">About Meetix</p>
        <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">A modern platform for instant human connection.</h1>
        <p className="mt-6 text-lg leading-8 text-white/65">
          Meetix was built with a simple goal: to make it incredibly easy for anyone, anywhere, to strike up a face-to-face conversation. Whether you're looking to make new friends, learn about different cultures, or just have a chat, Meetix brings the world to you.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {details.map(({ icon: Icon, title, body }) => (
          <div key={title} className="panel p-8 text-center transition-transform hover:-translate-y-1">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-violetGlow/20">
              <Icon className="h-7 w-7 text-mintGlow" />
            </div>
            <h2 className="mt-6 text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/10 bg-white/5">
              <UserRound className="h-8 w-8 text-mintGlow" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Subhadip Mudi</h2>
              <p className="text-sm font-semibold text-mintGlow">Creator & Developer</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3">
            <a className="footer-link group" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
              <GithubIcon className="h-5 w-5 text-white/70 transition group-hover:text-white" />
              Follow on GitHub
            </a>
            <a className="footer-link group" href={`mailto:${CONTACT_EMAIL}`}>
              <Mail className="h-5 w-5 text-white/70 transition group-hover:text-white" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="panel p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-violetGlow/20 blur-3xl" />
          <h2 className="relative z-10 text-2xl font-black">The Vision</h2>
          <p className="relative z-10 mt-4 text-base leading-7 text-white/75">
            We believe that technology should bring people closer together, not isolate them in echo chambers. Meetix focuses on raw, lightweight, and authentic conversations. The experience is designed to be as frictionless as possible: sign in, grant access, and immediately start meeting amazing people from around the globe.
          </p>
          
          <div className="relative z-10 mt-8">
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Powered By</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {techCards.map(([title, body]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-black/20 p-4 backdrop-blur transition hover:bg-white/10">
                  <p className="text-sm font-bold text-mintGlow">{title}</p>
                  <p className="mt-1 text-xs text-white/55">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutPage;
