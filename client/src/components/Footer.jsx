import { HeartHandshake, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL, GITHUB_PROFILE } from "../config";
import GithubIcon from "./GithubIcon";

const Footer = () => (
  <footer className="relative mt-20 border-t border-white/5 bg-[#040510] overflow-hidden">
    <div className="absolute left-1/2 top-0 h-[1px] w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-mintGlow/50 to-transparent" />
    <div className="absolute left-0 bottom-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-violetGlow/10 blur-[120px]" />
    
    <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] md:items-start lg:px-8">
      <div className="max-w-md">
        <Link to="/" className="inline-block transition-transform hover:scale-105">
          <span className="relative flex h-10 w-32 items-center justify-center overflow-hidden rounded-xl bg-[#161542]/50 shadow-glow ring-1 ring-violetGlow/30 backdrop-blur-md">
            <img
              src="/logo.png"
              alt="Meetix"
              className="absolute h-32 w-auto max-w-none"
            />
          </span>
        </Link>
        <p className="mt-6 text-sm leading-relaxed text-white/50">
          Meetix connects you with the world instantly. We believe in building a platform where people treat each other with patience, respect, and kindness. Start your next great conversation here.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <a href={GITHUB_PROFILE} target="_blank" rel="noreferrer" className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20">
            <GithubIcon className="h-5 w-5 text-white/60 transition group-hover:text-white" />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20">
            <Mail className="h-5 w-5 text-white/60 transition group-hover:text-white" />
          </a>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Platform</h3>
        <ul className="mt-6 grid gap-4 text-sm font-medium text-white/55">
          <li>
            <Link className="group inline-flex items-center gap-2 transition hover:text-mintGlow" to="/lobby">
              <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:text-mintGlow group-hover:translate-x-1" />
              Start matching
            </Link>
          </li>
          <li>
            <Link className="group inline-flex items-center gap-2 transition hover:text-mintGlow" to="/profile">
              <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:text-mintGlow group-hover:translate-x-1" />
              Your Profile
            </Link>
          </li>
          <li>
            <Link className="group inline-flex items-center gap-2 transition hover:text-mintGlow" to="/about">
              <ArrowRight className="h-4 w-4 text-white/20 transition-all group-hover:text-mintGlow group-hover:translate-x-1" />
              About Meetix
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Community</h3>
        <ul className="mt-6 grid gap-4 text-sm font-medium text-white/55">
          <li className="flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-rose-400" />
            <span className="text-white/70">Respect First Policy</span>
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-mintGlow" />
            <span className="text-white/70">Secure Interactions</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/5 py-6 text-center">
      <p className="text-xs text-white/30">
        &copy; {new Date().getFullYear()} Meetix. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
