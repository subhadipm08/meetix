import { Github, Mail, RadioTower, Server, Sparkles, UserRound } from "lucide-react";
import { CONTACT_EMAIL, GITHUB_PROFILE } from "../config";

const techCards = [
  ["WebRTC", "low-latency video"],
  ["Socket.io", "matching and chat"],
  ["JWT", "secure sessions"],
];

const details = [
  { icon: Server, title: "Backend", body: "Express, MongoDB, Redis counters, Socket.io rooms, and JWT socket authentication." },
  { icon: RadioTower, title: "Realtime", body: "Random queue matching, partner disconnect handling, WebRTC signaling, and text chat relay." },
  { icon: Sparkles, title: "Frontend", body: "React, Tailwind, responsive marketing pages, protected lobby, profile, and toast notifications." },
];

const AboutPage = () => (
  <section className="relative min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
    <div className="hero-grid absolute inset-0 opacity-35" />
    <div className="relative mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="eyebrow">About Meetix</p>
        <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-6xl">A realtime video chat project by Subhadip Mudi.</h1>
        <p className="mt-6 text-lg leading-8 text-white/65">
          Meetix is designed as a modern random video chat app where authenticated users can
          enter a lobby, grant camera and microphone access, find a stranger, talk over video,
          and keep a text chat open beside the call.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {details.map(({ icon: Icon, title, body }) => (
          <div key={title} className="panel p-6">
            <Icon className="h-7 w-7 text-mintGlow" />
            <h2 className="mt-5 text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {techCards.map(([title, body]) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="mt-1 text-sm text-white/55">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="panel p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-violetGlow/20">
              <UserRound className="h-8 w-8 text-mintGlow" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Subhadip Mudi</h2>
              <p className="text-sm text-white/55">Developer of Meetix</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <a className="footer-link" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
              <Github className="h-4 w-4" />
              GitHub profile
            </a>
            <a className="footer-link" href={`mailto:${CONTACT_EMAIL}`}>
              <Mail className="h-4 w-4" />
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="text-2xl font-black">Project notes</h2>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Meetix focuses on quick, lightweight conversations while keeping the experience
            simple: create an account, start a chat, meet a random partner, and move to the
            next conversation whenever you are ready.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default AboutPage;
