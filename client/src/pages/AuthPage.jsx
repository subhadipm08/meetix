import { CheckCircle2, Heart, Mail, ShieldCheck, Sparkles, UserRound, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { register, verifyOtp } from "../services/api";
import { useAuth } from "../state/AuthContext";
import { useToast } from "../state/ToastContext";

const genderOptions = [
  {
    value: "other",
    label: "Other",
    text: "Keep it flexible",
    icon: Sparkles,
  },
  {
    value: "male",
    label: "Male",
    text: "Match as male",
    icon: UserRound,
  },
  {
    value: "female",
    label: "Female",
    text: "Match as female",
    icon: Heart,
  },
];

const AuthPage = ({ mode }) => {
  const isRegister = mode === "register";
  const [form, setForm] = useState({
    username: "",
    email: "",
    identifier: "",
    password: "",
    gender: "other",
    otp: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, completeOtpLogin } = useAuth();
  const { pushToast } = useToast();

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (!isRegister) {
        await signIn({ identifier: form.identifier, password: form.password });
        return;
      }

      if (!otpSent) {
        await register(form);
        setOtpSent(true);
        pushToast("OTP sent to your email.", "success");
        return;
      }

      const data = await verifyOtp({ email: form.email, otp: form.otp });
      completeOtpLogin(data);
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div className="hero-grid absolute inset-0 opacity-40" />
      <div className="absolute left-10 top-32 h-72 w-72 rounded-full bg-violetGlow/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <p className="eyebrow">{isRegister ? "Create account" : "Welcome back"}</p>
          <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">
            {isRegister ? "Get verified, then jump into the lobby." : "Sign in and Meetix will reconnect the room."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/65">
            Access tokens are stored locally for fast auto-login, while socket handshakes use
            the same token the server already expects.
          </p>
        </div>

        <form onSubmit={submit} className="panel p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-violetGlow/20">
              {isRegister ? <ShieldCheck className="h-6 w-6 text-mintGlow" /> : <UserRound className="h-6 w-6 text-mintGlow" />}
            </div>
            <div>
              <h2 className="text-2xl font-black">{isRegister ? "Register" : "Login"}</h2>
              <p className="text-sm text-white/55">
                {isRegister ? "OTP verification is required." : "Use username or email."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {isRegister ? (
              <>
                <label className="field-label">
                  Username
                  <input className="input" name="username" value={form.username} onChange={update} required minLength={3} />
                </label>
                <label className="field-label">
                  Email
                  <input className="input" name="email" type="email" value={form.email} onChange={update} required />
                </label>
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-bold text-white/70">Gender</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {genderOptions.map(({ value, label, text, icon: Icon }) => {
                      const selected = form.gender === value;

                      return (
                        <label
                          key={value}
                          className={`relative cursor-pointer rounded-lg border p-4 transition hover:-translate-y-0.5 ${
                            selected
                              ? "border-mintGlow bg-mintGlow/10 shadow-mint"
                              : "border-white/10 bg-white/10 hover:bg-white/15"
                          }`}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="gender"
                            value={value}
                            checked={selected}
                            onChange={update}
                          />
                          <div className="flex items-start justify-between gap-3">
                            <span className={`grid h-10 w-10 place-items-center rounded-lg ${selected ? "bg-mintGlow text-ink" : "bg-violetGlow/20 text-mintGlow"}`}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <CheckCircle2 className={`h-5 w-5 ${selected ? "text-mintGlow" : "text-white/20"}`} />
                          </div>
                          <span className="mt-4 block text-base font-black text-white">{label}</span>
                          <span className="mt-1 block text-xs font-semibold text-white/55">{text}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </>
            ) : (
              <label className="field-label">
                Username or email
                <input className="input" name="identifier" value={form.identifier} onChange={update} required />
              </label>
            )}

            <label className="field-label">
              Password
              <div className="relative">
                <input className="input pr-10 w-full" name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update} required minLength={6} />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {otpSent && (
              <label className="field-label">
                OTP
                <input className="input" name="otp" value={form.otp} onChange={update} required />
              </label>
            )}
          </div>

          <button className="btn-primary mt-6 w-full justify-center py-3" disabled={loading}>
            <Mail className="h-5 w-5" />
            {loading ? "Please wait" : isRegister && !otpSent ? "Send OTP" : isRegister ? "Verify and enter" : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-white/60">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link className="font-bold text-mintGlow" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Register"}
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default AuthPage;
