import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { readMailApiJson } from "../lib/contactFormDiagnostics";
import { mailApiBase } from "../lib/mailApi";

const CAPTCHA_LENGTH = 5;

type Props = {
  active: boolean;
  answer: string;
  onAnswerChange: (value: string) => void;
  onTokenChange: (token: string) => void;
  onLoadError: (message: string) => void;
};

export function ContactImageCaptcha({
  active,
  answer,
  onAnswerChange,
  onTokenChange,
  onLoadError,
}: Props) {
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    onAnswerChange("");
    onTokenChange("");
    try {
      const url = `${mailApiBase()}/api/captcha`;
      const res = await fetch(url);
      const data = await readMailApiJson<{
        ok?: boolean;
        token?: string;
        imageDataUrl?: string;
        error?: string;
      }>(res, url);
      if (!res.ok || !data.ok || !data.token || !data.imageDataUrl) {
        throw new Error(data.error || "Could not load verification image.");
      }
      setImageDataUrl(data.imageDataUrl);
      onTokenChange(data.token);
    } catch (err) {
      setImageDataUrl("");
      onTokenChange("");
      onLoadError(
        err instanceof Error ? err.message : "Could not load verification image.",
      );
    } finally {
      setLoading(false);
    }
  }, [onAnswerChange, onLoadError, onTokenChange]);

  useEffect(() => {
    if (!active) {
      setImageDataUrl("");
      onAnswerChange("");
      onTokenChange("");
      return;
    }
    void loadCaptcha();
  }, [active, loadCaptcha]);

  if (!active) {
    return (
      <p className="body-refined text-ivory-muted/45 text-sm border border-gold/10 px-4 py-3">
        Fill in your name, email, and message above. Enter the numbers from the
        image here, then send.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="contact-captcha-answer"
          className="eyebrow eyebrow--gold-emphasis block mb-1"
        >
          Enter the numbers shown *
        </label>
        <p className="body-refined text-ivory-muted/55 text-sm">
          Type the {CAPTCHA_LENGTH} digits from the image, then click Send
          Message.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-sm border border-gold/15 bg-ivory/5 p-1 min-h-[62px] min-w-[200px] flex items-center justify-center">
          {loading ? (
            <span className="text-ivory-muted/50 text-xs px-4">Loading…</span>
          ) : imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt="Verification code — enter the numbers shown"
              width={200}
              height={60}
              className="block h-[60px] w-[200px] rounded-sm"
              draggable={false}
            />
          ) : (
            <span className="text-ivory-muted/50 text-xs px-4">No image</span>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors px-2 py-1"
          onClick={() => void loadCaptcha()}
          disabled={loading}
          aria-label="Refresh verification image"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          New image
        </button>
      </div>

      <input
        id="contact-captcha-answer"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={CAPTCHA_LENGTH}
        value={answer}
        onChange={(e) =>
          onAnswerChange(e.target.value.replace(/\D/g, "").slice(0, CAPTCHA_LENGTH))
        }
        placeholder={`${CAPTCHA_LENGTH}-digit code`}
        className="ghd-input max-w-xs tracking-[0.35em] font-mono text-lg"
        aria-describedby="contact-captcha-hint"
        required
      />
      <p id="contact-captcha-hint" className="text-ivory-muted/45 text-xs">
        Numbers only · {CAPTCHA_LENGTH} digits
      </p>
    </div>
  );
}

export const CONTACT_IMAGE_CAPTCHA_LENGTH = CAPTCHA_LENGTH;
