import { Radio, Sparkles } from "lucide-react";

const FindingAnimation = () => (
  <div className="relative mx-auto grid h-56 w-56 place-items-center">
    <div className="absolute inset-0 animate-orbit rounded-full border border-dashed border-violetGlow/60" />
    <div className="absolute inset-5 animate-orbit rounded-full border border-dashed border-mintGlow/40 [animation-direction:reverse]" />
    <div className="absolute h-36 w-36 animate-pulseGlow rounded-full bg-violetGlow/20 blur-2xl" />
    <div className="relative grid h-28 w-28 place-items-center rounded-full border border-white/10 bg-white/10 shadow-glow backdrop-blur">
      <Radio className="h-10 w-10 text-mintGlow" />
    </div>
    <Sparkles className="absolute right-4 top-10 h-5 w-5 animate-pulse text-mintGlow" />
    <Sparkles className="absolute bottom-12 left-3 h-4 w-4 animate-pulse text-violet-200" />
  </div>
);

export default FindingAnimation;
