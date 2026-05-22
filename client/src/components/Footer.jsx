import { Github, HeartHandshake, Mail, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL, GITHUB_PROFILE } from "../config";

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#060719]">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto_auto] md:items-start lg:px-8">
      <div className="max-w-md">
        <div className="flex items-center gap-3">
          <span className="relative h-9 w-28 overflow-hidden rounded-lg bg-[#161542] shadow-glow ring-1 ring-violetGlow/40">
            <img
              src="/logo.png"
              alt="Meetix"
              className="absolute left-1/2 top-1/2 h-28 w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
            />
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Meetix works best when people treat each other with patience and respect.
          Keep conversations friendly, protect your privacy, and move on if a chat does not feel right.
        </p>
      </div>

      <div className="grid gap-2 text-sm font-semibold text-white/55">
        <Link className="inline-flex items-center gap-2 transition hover:text-mintGlow" to="/profile">
          <UserRound className="h-4 w-4" />
          Profile
        </Link>
        <Link className="inline-flex items-center gap-2 transition hover:text-mintGlow" to="/lobby">
          <MessageCircle className="h-4 w-4" />
          Start chat
        </Link>
        <Link className="inline-flex items-center gap-2 transition hover:text-mintGlow" to="/about">
          <ShieldCheck className="h-4 w-4" />
          About
        </Link>
      </div>

      <div className="grid gap-2 text-sm font-semibold text-white/55">
        <a className="inline-flex items-center gap-2 transition hover:text-mintGlow" href={GITHUB_PROFILE} target="_blank" rel="noreferrer">
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <a className="inline-flex items-center gap-2 transition hover:text-mintGlow" href={`mailto:${CONTACT_EMAIL}`}>
          <Mail className="h-4 w-4" />
          {CONTACT_EMAIL}
        </a>
        <span className="inline-flex items-center gap-2 text-white/35">
          <HeartHandshake className="h-4 w-4" />
          Respect first
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
