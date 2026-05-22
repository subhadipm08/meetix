import { Link } from "react-router-dom";

const BrandLogo = () => (
  <Link to="/" className="group inline-flex items-center" aria-label="Go to Meetix home">
    <span className="relative h-14 w-40 overflow-hidden rounded-lg bg-[#161542] shadow-glow ring-1 ring-violetGlow/45 transition group-hover:ring-mintGlow/70 sm:w-44">
      <img
        src="/logo.png"
        alt="Meetix"
        className="absolute left-1/2 top-1/2 h-44 w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
      />
    </span>
  </Link>
);

export default BrandLogo;
