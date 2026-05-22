import { MessageCircle, Mic, MicOff, PhoneOff, RefreshCcw, Send, SkipForward, Video, VideoOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import FindingAnimation from "../components/FindingAnimation";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const LobbyPage = () => {
  const { socket, user } = useAuth();
  const { pushToast } = useToast();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const partnerRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [partner, setPartner] = useState(null);
  const [status, setStatus] = useState("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const requestMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraOn(true);
      setMicOn(true);
      pushToast("Camera and microphone are ready.", "success");
    } catch (error) {
      pushToast(error.message || "Camera or microphone permission was blocked.", "error");
    }
  }, [pushToast]);

  useEffect(() => {
    requestMedia();
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [requestMedia]);

  const cleanupPeer = useCallback(() => {
    peerRef.current?.close?.();
    peerRef.current = null;
    setRemoteStream(null);
  }, []);

  const createPeer = useCallback(
    (targetSocketId) => {
      cleanupPeer();
      const peer = new RTCPeerConnection(rtcConfig);
      const incoming = new MediaStream();

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice_candidate", { to: targetSocketId, payload: event.candidate });
        }
      };

      peer.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => incoming.addTrack(track));
        setRemoteStream(incoming);
      };

      localStreamRef.current?.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });

      peerRef.current = peer;
      return peer;
    },
    [cleanupPeer, socket],
  );

  const joinQueue = useCallback(() => {
    if (!socket?.connected) {
      pushToast("Realtime socket is not connected yet.", "error");
      return;
    }
    if (!localStreamRef.current) {
      pushToast("Allow camera and microphone first.", "error");
      requestMedia();
      return;
    }

    setStatus("finding");
    setPartner(null);
    setMessages([]);
    cleanupPeer();
    socket.emit("join_queue");
    pushToast("Searching for a new partner.", "info");
  }, [cleanupPeer, pushToast, requestMedia, socket]);

  const leaveCall = useCallback(() => {
    socket?.emit("leave_room");
    socket?.emit("leave_queue");
    cleanupPeer();
    setPartner(null);
    setMessages([]);
    setStatus("idle");
    pushToast("You left the current session.", "info");
  }, [cleanupPeer, pushToast, socket]);

  const nextPartner = useCallback(() => {
    socket?.emit("next");
    cleanupPeer();
    setPartner(null);
    setMessages([]);
    setStatus("finding");
    pushToast("Finding someone new.", "action");
  }, [cleanupPeer, pushToast, socket]);

  useEffect(() => {
    if (!socket) return undefined;

    const onMatchFound = async ({ user1, partner: matchedPartner }) => {
      const normalizedPartner = {
        ...matchedPartner,
        avatarlink: matchedPartner?.avatarlink || matchedPartner?.avatar,
      };
      partnerRef.current = normalizedPartner;
      setPartner(normalizedPartner);
      setStatus("inCall");
      pushToast(`Matched with ${normalizedPartner.username || "Stranger"}.`, "success");

      const shouldOffer = socket.id === user1;
      const peer = createPeer(normalizedPartner.socketId);

      if (shouldOffer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { to: normalizedPartner.socketId, payload: offer });
      }
    };

    const onOffer = async ({ from, payload }) => {
      const peer = createPeer(from);
      await peer.setRemoteDescription(new RTCSessionDescription(payload));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", { to: from, payload: answer });
    };

    const onAnswer = async ({ payload }) => {
      if (peerRef.current && !peerRef.current.currentRemoteDescription) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(payload));
      }
    };

    const onIceCandidate = async ({ payload }) => {
      if (peerRef.current && payload) {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(payload));
      }
    };

    const onChatMessage = ({ message: incomingMessage }) => {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          body: incomingMessage,
          author: partnerRef.current?.username || "Partner",
          mine: false,
        },
      ]);
    };

    const onPartnerDisconnected = ({ partner: partnerName }) => {
      cleanupPeer();
      setPartner(null);
      setMessages([]);
      setStatus("finding");
      pushToast(`${partnerName || "Partner"} disconnected. Re-queueing you now.`, "info");
      window.setTimeout(() => {
        if (socket.connected) socket.emit("join_queue");
      }, 700);
    };

    const onStatsUpdate = () => undefined;

    socket.on("match_found", onMatchFound);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice_candidate", onIceCandidate);
    socket.on("chat_message", onChatMessage);
    socket.on("partner_disconnected", onPartnerDisconnected);
    socket.on("stats_update", onStatsUpdate);

    return () => {
      socket.off("match_found", onMatchFound);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice_candidate", onIceCandidate);
      socket.off("chat_message", onChatMessage);
      socket.off("partner_disconnected", onPartnerDisconnected);
      socket.off("stats_update", onStatsUpdate);
    };
  }, [cleanupPeer, createPeer, pushToast, socket]);

  useEffect(() => {
    return () => {
      socket?.emit("leave_queue");
      socket?.emit("leave_room");
      cleanupPeer();
    };
  }, [cleanupPeer, socket]);

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    });
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !partner?.socketId) return;

    socket?.emit("chat_message", { to: partner.socketId, message: trimmed });
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), body: trimmed, author: user?.username || "You", mine: true },
    ]);
    setMessage("");
  };

  return (
    <section className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Lobby</p>
            <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
              {status === "finding" ? "Finding a partner..." : status === "inCall" ? `Chatting with ${partner?.username || "Stranger"}` : "Ready when your camera is."}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="icon-button" onClick={toggleCamera} title={cameraOn ? "Turn camera off" : "Turn camera on"}>
              {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button className="icon-button" onClick={toggleMic} title={micOn ? "Mute microphone" : "Unmute microphone"}>
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            <button className="btn-secondary" onClick={requestMedia}>
              <RefreshCcw className="h-4 w-4" />
              Media
            </button>
            {status === "inCall" ? (
              <>
                <button className="btn-primary" onClick={nextPartner}>
                  <SkipForward className="h-4 w-4" />
                  Next
                </button>
                <button className="btn-danger" onClick={leaveCall}>
                  <PhoneOff className="h-4 w-4" />
                  Leave
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={joinQueue} disabled={status === "finding"}>
                {status === "finding" ? "Searching" : "Start chat"}
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="panel p-3 sm:p-4">
            <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-white/10 bg-black shadow-glow">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-black object-cover"
              />

              {!remoteStream && (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(91,53,255,.28),transparent_48%),#050613]">
                  <div className="text-center">
                    {status === "finding" ? (
                      <>
                        <FindingAnimation />
                        <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-white/65">
                          Meetix is scanning the waiting queue. Keep this tab open and your media active.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/10">
                          <Video className="h-9 w-9 text-white/75" />
                        </div>
                        <p className="mt-4 text-base font-bold text-white/75">Your next chat appears here</p>
                        <p className="mt-2 text-sm text-white/45">Start chat when your camera and microphone are ready.</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={partner?.avatarlink || "/logo.png"}
                    alt=""
                    className="h-11 w-11 rounded-full bg-white object-cover"
                  />
                  <div>
                    <p className="text-sm font-black text-white">{partner?.username || "No partner yet"}</p>
                    <p className="text-xs font-semibold text-white/55">
                      {partner ? "Connected through Meetix" : status === "finding" ? "Searching the queue" : "Ready to start"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-20 w-40 overflow-hidden rounded-lg border border-white/10 bg-black shadow-mint sm:w-56">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 grid place-items-center bg-black/70">
                    <Video className="h-7 w-7 text-white/70" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-black/55 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                  <span>{user?.username || "You"}</span>
                  {micOn ? <Mic className="h-3.5 w-3.5 text-mintGlow" /> : <MicOff className="h-3.5 w-3.5 text-rose-300" />}
                </div>
              </div>
            </div>
          </div>

          <aside className="panel flex min-h-[560px] flex-col overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-violetGlow/20">
                  <MessageCircle className="h-5 w-5 text-mintGlow" />
                </div>
                <div>
                  <h2 className="font-black text-white">Text chat</h2>
                  <p className="text-sm text-white/50">
                    {partner ? `Talking with ${partner.username || "your partner"}` : "Available after matching"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10">
                      <MessageCircle className="h-6 w-6 text-mintGlow" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-white/70">No messages yet</p>
                    <p className="mt-2 max-w-56 text-sm leading-6 text-white/45">
                      Once you match, keep the conversation going here without covering the video.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((item) => (
                  <div key={item.id} className={`flex ${item.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-lg px-3 py-2 shadow-sm ${item.mine ? "bg-violetGlow text-white" : "bg-white/10 text-white/85"}`}>
                      <p className="text-[11px] font-black uppercase text-white/50">{item.mine ? "You" : item.author}</p>
                      <p className="mt-1 break-words text-sm leading-5">{item.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-white/10 bg-white/5 p-4">
              <div className="flex gap-2">
                <input
                  className="input"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={partner ? "Type a message" : "Waiting for match"}
                  disabled={!partner}
                />
                <button className="icon-button shrink-0" disabled={!partner || !message.trim()} title="Send message">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default LobbyPage;
