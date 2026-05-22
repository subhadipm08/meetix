import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const VideoTile = ({ label, muted, stream, videoRef, isLocal, cameraOn = true, micOn = true }) => (
  <div className="relative min-h-[260px] overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className="h-full min-h-[260px] w-full bg-black object-cover"
    />
    {!stream && (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(91,53,255,.22),transparent_48%)]">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/10">
            {cameraOn ? <Video className="h-7 w-7 text-white/75" /> : <VideoOff className="h-7 w-7 text-white/75" />}
          </div>
          <p className="mt-3 text-sm font-semibold text-white/75">{isLocal ? "Camera preview" : "Waiting for video"}</p>
        </div>
      </div>
    )}
    <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-sm font-semibold backdrop-blur">
      <span>{label}</span>
      {micOn ? <Mic className="h-4 w-4 text-mintGlow" /> : <MicOff className="h-4 w-4 text-rose-300" />}
    </div>
  </div>
);

export default VideoTile;
