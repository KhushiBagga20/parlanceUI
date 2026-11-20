/**
 * The Sign → Text camera stage: a large viewport with minimal overlays, live
 * subtitles for accepted signs, and a floating transport for camera controls.
 */
import type { ReactNode } from "react";
import { Camera, CameraOff, CheckCircle2, Grid2x2, Loader2, Lock, Power, ShieldAlert, Spline, TriangleAlert, VideoOff, XCircle } from "lucide-react";
import { Pal } from "@/components/brand/Pal";
import { SigningLoader } from "@/components/ui/SigningLoader";
import { cn } from "@/lib/cn";
import type { CameraTracking } from "@/services/camera/useCameraTracking";
import { FramingGuide } from "./FramingGuide";

interface CameraStageProps {
  camera: CameraTracking;
  recognising: boolean;
  onRecognising: (on: boolean) => void;
  recognitionAvailable: boolean;
  cameraId: string | null;
  onCameraId: (id: string | null) => void;
  showLandmarks: boolean;
  onShowLandmarks: (on: boolean) => void;
  showGuide: boolean;
  onShowGuide: (on: boolean) => void;
  serviceHost: string;
  /** Labels of the signs accepted in the sentence being built. */
  subtitles: string[];
  /** The sign just accepted, briefly. */
  flash: string | null;
}

function ToolButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "press inline-flex size-9 items-center justify-center rounded-full sm:size-10 [&_svg]:size-[1.125rem]",
        pressed ? "bg-navy text-white" : "text-ink-2 hover:bg-butter-100 hover:text-navy",
      )}
    >
      {children}
    </button>
  );
}

export function CameraStage({
  camera,
  recognising,
  onRecognising,
  recognitionAvailable,
  cameraId,
  onCameraId,
  showLandmarks,
  onShowLandmarks,
  showGuide,
  onShowGuide,
  serviceHost,
  subtitles,
  flash,
}: CameraStageProps) {
  const running = camera.status === "running";
  const { quality } = camera;
  const hint = !running
    ? null
    : camera.tracker === "loading"
      ? { tone: "busy", text: "Starting the hand tracker…" }
      : camera.tracker === "error"
        ? { tone: "error", text: "Hand tracking failed to start" }
        : !quality.body
          ? { tone: "warn", text: "Step back: head and both shoulders in frame" }
          : quality.hands === 0
            ? { tone: "warn", text: "Raise your hands into the frame" }
            : quality.losingHand
              ? { tone: "warn", text: "Losing a hand: add light, or move away from the background" }
              : { tone: "ok", text: quality.hands === 2 ? "Tracking both hands" : "Tracking one hand" };

  return (
    <section
      aria-label="Camera"
      className="relative isolate flex h-full min-h-[28rem] flex-col overflow-hidden bg-[linear-gradient(180deg,var(--color-sky-25),var(--color-sky-100)_70%,var(--color-sky-200))]"
    >
      <div aria-hidden className="dot-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)]" />
      <div aria-hidden className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-mint-100" />
      {/* top bar */}
      <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
        <p className="flex items-center gap-2 rounded-full bg-surface/95 py-2 pr-4 pl-3 text-[0.8125rem] font-semibold text-navy shadow-sm ring-1 ring-line">
          {running ? (
            <span aria-hidden className="relative inline-flex size-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-danger/50" />
              <span className="relative size-2.5 rounded-full bg-danger" />
            </span>
          ) : (
            <CameraOff className="size-4 text-ink-3" aria-hidden />
          )}
          {running ? "Camera on" : "Camera off"}
          {running && camera.fps > 0 && <span className="font-medium text-ink-3">· {camera.fps} fps on-device</span>}
        </p>
        <div className="flex items-center gap-0.5 rounded-full bg-surface/95 p-1 shadow-sm ring-1 ring-line" role="toolbar" aria-label="Camera overlays">
          <ToolButton label={showLandmarks ? "Hide hand landmarks" : "Show hand landmarks"} pressed={showLandmarks} onClick={() => onShowLandmarks(!showLandmarks)}>
            <Spline aria-hidden />
          </ToolButton>
          <ToolButton label={showGuide ? "Hide framing guide" : "Show framing guide"} pressed={showGuide} onClick={() => onShowGuide(!showGuide)}>
            <Grid2x2 aria-hidden />
          </ToolButton>
        </div>
      </div>

      {/* viewport */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-6">
        <div className="relative aspect-[3/4] w-full max-w-[min(100%,calc((100dvh-15rem)*16/9))] overflow-hidden rounded-[1.5rem] bg-sky-50 shadow-card ring-4 ring-surface sm:aspect-video">
          <video
            ref={camera.videoRef}
            playsInline
            muted
            aria-label="Your camera preview, mirrored"
            className={cn("absolute inset-0 h-full w-full -scale-x-100 object-cover", !running && "invisible")}
          />
          <canvas
            ref={camera.canvasRef}
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover", !running && "invisible")}
          />
          {running && showGuide && <FramingGuide highlight={!quality.body ? "body" : quality.hands === 0 ? "hands" : "ok"} />}

          {running && hint && (
            <p
              role="status"
              className={cn(
                "absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] animate-pop items-center gap-2 rounded-full bg-surface/95 py-1.5 pr-3.5 pl-2.5 text-[0.8125rem] font-semibold shadow-sm",
                hint.tone === "warn" ? "text-gold-800" : hint.tone === "error" ? "text-danger" : hint.tone === "ok" ? "text-success" : "text-royal",
              )}
            >
              {hint.tone === "busy" ? (
                <SigningLoader label={hint.text} size="sm" decorative className="size-5" />
              ) : hint.tone === "warn" ? (
                <TriangleAlert className="size-4 shrink-0" aria-hidden />
              ) : hint.tone === "error" ? (
                <XCircle className="size-4 shrink-0" aria-hidden />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              )}
              {hint.text}
            </p>
          )}

          {/* live subtitles */}
          {running && (subtitles.length > 0 || flash) && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-6" aria-hidden>
              <p className="max-w-full rounded-2xl bg-navy/85 px-5 py-2.5 text-center text-xl leading-snug font-bold tracking-[0.02em] text-white uppercase backdrop-blur-sm sm:text-[1.75rem]">
                {subtitles.map((w, i) => (
                  <span key={`${w}-${i}`} className={cn("mx-1.5 inline-block", i === subtitles.length - 1 && flash ? "text-gold" : "")}>
                    {w}
                  </span>
                ))}
              </p>
            </div>
          )}

          {!running && <CameraState camera={camera} />}
        </div>
      </div>

      {/* transport */}
      <div className="p-3 sm:p-4">
        <div className="focus-inverse mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-[1.75rem] bg-navy p-2 text-white shadow-[var(--shadow-float)] sm:gap-3">
          {running ? (
            <button
              type="button"
              onClick={camera.stop}
              className="press inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 text-[0.9375rem] font-semibold text-white hover:bg-white/15"
            >
              <CameraOff className="size-[1.125rem]" aria-hidden /> Stop camera
            </button>
          ) : (
            <button
              type="button"
              onClick={camera.start}
              disabled={camera.status === "requesting"}
              className="press inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-mint-300 px-5 text-[0.9375rem] font-bold text-navy hover:bg-mint-200 disabled:opacity-60"
            >
              {camera.status === "requesting" ? <Loader2 className="size-[1.125rem] animate-spin" aria-hidden /> : <Power className="size-[1.125rem]" aria-hidden />}
              {camera.status === "requesting" ? "Waiting for permission…" : "Start camera"}
            </button>
          )}

          <button
            type="button"
            role="switch"
            aria-checked={recognising && recognitionAvailable}
            disabled={!recognitionAvailable}
            onClick={() => onRecognising(!recognising)}
            className="press inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full px-3 text-[0.9375rem] font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            <span
              aria-hidden
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                recognising && recognitionAvailable ? "bg-gold" : "bg-white/25",
              )}
            >
              <span
                className={cn(
                  "absolute size-4 rounded-full bg-white transition-transform",
                  recognising && recognitionAvailable ? "translate-x-[1.125rem] bg-navy" : "translate-x-0.5",
                )}
              />
            </span>
            {!recognitionAvailable ? "Recognition unavailable" : recognising ? "Recognising" : "Paused"}
          </button>

          <label className="flex min-w-[min(100%,11rem)] flex-1 items-center gap-2 text-[0.8125rem] text-white/70">
            <Camera className="size-4 shrink-0" aria-hidden />
            <span className="sr-only">Camera</span>
            <select
              value={cameraId ?? ""}
              onChange={(e) => onCameraId(e.target.value || null)}
              disabled={camera.devices.length === 0}
              className="h-11 w-full min-w-0 rounded-full bg-white/10 px-4 text-[0.875rem] text-white disabled:opacity-60 [&>option]:text-ink"
            >
              <option value="">Default camera</option>
              {camera.devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mx-auto mt-2.5 flex max-w-3xl items-start justify-center gap-1.5 text-center text-xs leading-5 text-ink-3">
          <Lock className="mt-0.5 size-3 shrink-0 text-royal" aria-hidden />
          <span>
            Video never leaves this device and is never recorded. Only hand and shoulder positions are sent to{" "}
            <span className="font-medium text-ink-2">{serviceHost}</span>.
          </span>
        </p>
      </div>
    </section>
  );
}

function StateBody({ icon, title, children, tone = "neutral" }: { icon: ReactNode; title: string; children?: ReactNode; tone?: "neutral" | "warning" | "danger" }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <span
        className={cn(
          "inline-flex size-16 items-center justify-center rounded-full [&_svg]:size-7",
          tone === "danger" && "bg-danger-bg text-danger",
          tone === "warning" && "bg-butter-200 text-gold-800",
          tone === "neutral" && "bg-surface text-royal shadow-card",
        )}
      >
        {icon}
      </span>
      <p className="mt-4 text-xl font-bold tracking-[-0.02em] text-navy" role="status">
        {title}
      </p>
      {children && <div className="mt-2 max-w-md text-[0.9375rem] leading-6 text-ink-2">{children}</div>}
    </div>
  );
}

function CameraState({ camera }: { camera: CameraTracking }) {
  switch (camera.status) {
    case "requesting":
      return (
        <StateBody icon={<SigningLoader label="Waiting for camera permission" decorative className="size-9" />} title="Waiting for camera permission">
          Your browser is asking whether Parlance may use the camera. Choose Allow to continue.
        </StateBody>
      );
    case "denied":
      return (
        <StateBody icon={<ShieldAlert />} title="Camera access is blocked" tone="danger">
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-left">
            <li>Open the site settings icon in your browser&rsquo;s address bar.</li>
            <li>Set Camera to Allow for this site.</li>
            <li>Press Start camera again.</li>
          </ol>
        </StateBody>
      );
    case "unavailable":
      return (
        <StateBody icon={<VideoOff />} title="No camera available" tone="warning">
          {camera.errorDetail ?? "Connect a camera, or check that your system settings allow this browser to use it."}
        </StateBody>
      );
    case "in-use":
      return (
        <StateBody icon={<VideoOff />} title="The camera is in use elsewhere" tone="warning">
          Another app or tab is using the camera. Close it, then press Start camera again.
        </StateBody>
      );
    case "error":
      return (
        <StateBody icon={<VideoOff />} title="The camera couldn't start" tone="danger">
          {camera.errorDetail ?? "Try again, or choose a different camera."}
        </StateBody>
      );
    default:
      if (camera.permission === "denied") {
        return (
          <StateBody icon={<ShieldAlert />} title="Camera access is blocked for this site" tone="danger">
            Allow the camera in your browser&rsquo;s site settings, then press Start camera.
          </StateBody>
        );
      }
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative flex size-36 items-end justify-center sm:size-44" aria-hidden>
            <span className="absolute inset-x-2 bottom-0 top-4 rounded-full bg-mint-200" />
            <Pal pose="rest" outfit="royal" skin="deep" hair="curly" className="relative h-28 sm:h-36" />
            <svg viewBox="0 0 160 160" className="absolute inset-0 size-full" fill="none">
              <path
                d="M10 34V18a8 8 0 0 1 8-8h16M150 34V18a8 8 0 0 0-8-8h-16M10 126v16a8 8 0 0 0 8 8h16M150 126v16a8 8 0 0 1-8 8h-16"
                stroke="#011638"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="mt-5 text-xl font-bold tracking-[-0.025em] text-navy sm:text-2xl">Sign to the camera</p>
          <p className="mt-2 max-w-sm text-[0.9375rem] leading-6 text-ink-2">
            Press Start camera, stand about an arm&rsquo;s length back, and sign one word at a time.
          </p>
        </div>
      );
  }
}
