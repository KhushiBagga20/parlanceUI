import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, CheckCircle2, CircleHelp, CirclePause, Hand, PlugZap, RefreshCw, ScanLine, ServerOff, TriangleAlert, UserRound } from "lucide-react";
import { SigningLoader } from "@/components/ui/SigningLoader";
import { cn } from "@/lib/cn";
import type { CameraTracking } from "@/services/camera/useCameraTracking";
import type { AcceptedSign, RecognitionService, RejectReason } from "@/services/recognition/useRecognitionService";
import { glossLabel, trustOf, type RecognitionMetrics, type SignLibrary } from "@/services/signs/library";

interface ReadoutProps {
  camera: CameraTracking;
  service: RecognitionService;
  recognising: boolean;
  accepted: AcceptedSign | null;
  threshold: number;
  metrics: RecognitionMetrics;
  library: SignLibrary;
}

const REASON_TEXT: Record<Exclude<RejectReason, "resting">, string> = {
  "low-confidence": "Below the confidence threshold, so nothing is output.",
  unverified: "This sign isn't verified for recognition yet, so nothing is output.",
  unstable: "Not held steadily enough to be sure. Hold the sign a moment longer.",
  "already-emitted": "Already added. Lower your hands briefly before repeating a sign.",
};

type Tone = "neutral" | "success" | "warning" | "danger" | "muted";

/* Every state pairs its colour with an icon and a written title. */
const TONE: Record<Tone, { card: string; icon: string }> = {
  neutral: { card: "bg-sky-50 ring-sky-200", icon: "bg-surface text-royal" },
  success: { card: "bg-mint-50 ring-mint-200", icon: "bg-mint-300 text-navy" },
  warning: { card: "bg-butter-50 ring-butter-200", icon: "bg-butter-200 text-gold-800" },
  danger: { card: "bg-danger-bg ring-danger/20", icon: "bg-surface text-danger" },
  muted: { card: "bg-cream ring-line", icon: "bg-surface text-ink-3" },
};

function State({ icon, title, children, tone = "neutral", action }: { icon: ReactNode; title: ReactNode; children?: ReactNode; tone?: Tone; action?: ReactNode }) {
  return (
    <div className={cn("min-h-[8.5rem] animate-pop rounded-[1.25rem] p-4 ring-1", TONE[tone].card)}>
      <span className={cn("inline-flex size-9 items-center justify-center rounded-full shadow-xs [&_svg]:size-[1.125rem]", TONE[tone].icon)}>{icon}</span>
      <div className="mt-2.5 text-xl leading-7 font-bold tracking-[-0.02em] text-navy">{title}</div>
      {children && <div className="mt-1.5 text-[0.9375rem] leading-6 text-ink-2">{children}</div>}
      {action && <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

function Meter({ value, threshold, label }: { value: number; threshold: number; label: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs font-medium text-ink-3">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        className="relative mt-1.5 h-2 rounded-full bg-surface ring-1 ring-line"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={cn("absolute inset-y-0 left-0 rounded-full", value >= threshold ? "bg-success" : "bg-ink-3/50")} style={{ width: `${pct}%` }} />
        <div aria-hidden className="absolute -top-1 -bottom-1 w-0.5 bg-navy" style={{ left: `${Math.round(threshold * 100)}%` }} />
      </div>
      <p className="mt-1 text-xs text-ink-3">Line marks the {Math.round(threshold * 100)}% threshold</p>
    </div>
  );
}

export function ServiceStatus({ service }: { service: RecognitionService }) {
  const c = service.connection;
  const view =
    c === "open"
      ? { icon: <CheckCircle2 className="size-4 text-success" aria-hidden />, text: "Recognition service connected", pill: "bg-mint-50 ring-mint-200" }
      : c === "connecting"
        ? { icon: <SigningLoader label="Connecting" decorative className="size-5" />, text: "Connecting to the recognition service", pill: "bg-sky-50 ring-sky-200" }
        : c === "no-model"
          ? { icon: <TriangleAlert className="size-4 text-gold-800" aria-hidden />, text: "Service running without a model", pill: "bg-butter-50 ring-butter-200" }
          : { icon: <ServerOff className="size-4 text-danger" aria-hidden />, text: "Recognition service offline", pill: "bg-danger-bg ring-danger/20" };
  return (
    <p className={cn("flex w-fit items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2.5 text-[0.8125rem] font-semibold text-navy ring-1", view.pill)} role="status">
      <span className="inline-flex size-5 items-center justify-center">{view.icon}</span>
      {view.text}
    </p>
  );
}

export function RecognitionReadout({ camera, service, recognising, accepted, threshold, metrics, library }: ReadoutProps) {
  if (accepted) {
    const verified = trustOf(accepted.word, metrics) === "verified";
    return (
      <State tone="success" icon={<BadgeCheck />} title={<span className="text-[2.75rem] leading-none tracking-[-0.03em] uppercase">{glossLabel(accepted.word, library)}</span>}>
        <span className="font-medium text-success">Recognised and added{verified ? " · verified sign" : ""}</span>
        <Meter value={accepted.confidence} threshold={threshold} label="Confidence" />
      </State>
    );
  }
  if (service.connection === "offline" || service.connection === "idle") {
    return (
      <State
        tone="danger"
        icon={<ServerOff />}
        title="Recognition service offline"
        action={
          <>
            <button
              type="button"
              onClick={service.retry}
              className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-[0.8125rem] font-semibold text-navy hover:border-navy/40"
            >
              <RefreshCw className="size-3.5" aria-hidden /> {service.gaveUp ? "Try again" : "Retry now"}
            </button>
            <Link to="/app/help#service" className="inline-flex h-9 items-center px-1 text-[0.8125rem] font-semibold text-royal hover:underline">
              How to start it
            </Link>
          </>
        }
      >
        The camera and hand tracking still work here, but signs can&rsquo;t be interpreted until the service is running.
        {!service.gaveUp && <span className="mt-1 block text-xs text-ink-3">Retrying automatically…</span>}
      </State>
    );
  }
  if (service.connection === "connecting") {
    return <State tone="muted" icon={<SigningLoader label="Connecting" decorative className="size-6" />} title="Connecting…" />;
  }
  if (service.connection === "no-model") {
    return (
      <State tone="warning" icon={<PlugZap />} title="No trained model loaded">
        The service is running but cannot recognise signs until a model is added to its model folder.
      </State>
    );
  }
  if (camera.status !== "running") {
    return (
      <State tone="muted" icon={<ScanLine />} title="Start the camera to begin">
        Sign one word at a time. Recognised signs build a sentence below.
      </State>
    );
  }
  if (!recognising) {
    return (
      <State tone="muted" icon={<CirclePause />} title="Recognition paused">
        The camera is on, but nothing is being sent for recognition.
      </State>
    );
  }
  if (!camera.quality.body) {
    return (
      <State tone="warning" icon={<UserRound />} title="Step back into frame">
        Recognition needs your head and both shoulders in view.
      </State>
    );
  }
  if (camera.quality.hands === 0) {
    return (
      <State tone="muted" icon={<Hand />} title="Waiting for a sign">
        Raise your hands into the frame and sign one word.
      </State>
    );
  }
  if (service.buffered) {
    const pct = Math.round((service.buffered.have / Math.max(1, service.buffered.need)) * 100);
    return (
      <State tone="neutral" icon={<ScanLine />} title="Watching your signing…">
        Collecting two seconds of movement before deciding.
        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-surface ring-1 ring-sky-200" aria-hidden>
          <span className="block h-full rounded-full bg-royal transition-[width]" style={{ width: `${pct}%` }} />
        </span>
      </State>
    );
  }
  const candidate = service.candidate;
  if (candidate && candidate.reason !== "resting") {
    return (
      <State tone="warning" icon={<CircleHelp />} title="Not recognised">
        {REASON_TEXT[candidate.reason]}
        <span className="mt-2 block text-xs text-ink-3">
          Closest guess, not accepted: <span className="font-semibold text-ink-2">{glossLabel(candidate.word, library)}</span>
        </span>
        <Meter value={candidate.confidence} threshold={threshold} label="Closest guess" />
      </State>
    );
  }
  return (
    <State tone="neutral" icon={<Hand />} title="No sign detected">
      Hands are in view but no sign is being made. Parlance stays silent rather than guess.
    </State>
  );
}
