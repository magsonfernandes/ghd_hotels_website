import { X } from "lucide-react";
import { useEffect, useId } from "react";
import type { JobPosting } from "../lib/jobPostings";

type Props = {
  job: JobPosting | null;
  onClose: () => void;
  onApply: (jobId: string) => void;
};

export function CareersJobModal({ job, onClose, onApply }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!job) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [job, onClose]);

  if (!job) return null;

  const p =
    "font-body text-sm sm:text-[0.95rem] text-ivory-muted/70 leading-relaxed";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close job details"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-gold/20 bg-charcoal shadow-2xl shadow-black/50 flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gold/15 px-5 sm:px-8 py-5 sm:py-6 shrink-0">
          <div className="min-w-0">
            <p className="eyebrow eyebrow--gold-emphasis mb-2">Open position</p>
            <h2
              id={titleId}
              className="font-display text-ivory text-xl sm:text-2xl"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              {job.title}
            </h2>
            <p className="text-xs uppercase tracking-[0.16em] text-gold/85 mt-2">
              {job.location} · {job.type}
              {job.department ? ` · ${job.department}` : ""}
            </p>
            {job.reportsTo ? (
              <p className={`${p} text-xs uppercase tracking-[0.12em] mt-2`}>
                Reports to: {job.reportsTo}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-gold/20 p-2 text-ivory-muted/80 hover:text-ivory hover:border-gold/40 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          <p className={p}>{job.summary}</p>
          {job.aboutUs ? (
            <div>
              <h3 className="eyebrow eyebrow--gold-emphasis mb-3">
                About the role
              </h3>
              <p className={p}>{job.aboutUs}</p>
            </div>
          ) : null}
          {job.sections?.map((section) => (
            <div key={section.heading}>
              <h3
                className="font-display text-ivory text-base sm:text-lg mb-3"
                style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
              >
                {section.heading}
              </h3>
              {section.body
                ? section.body.split("\n\n").map((paragraph) => (
                    <p key={paragraph} className={`${p} mb-3 last:mb-0`}>
                      {paragraph}
                    </p>
                  ))
                : null}
              {section.items?.length ? (
                <ul className={`${p} list-disc pl-5 space-y-2`}>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {job.qualifications?.length ? (
            <div>
              <h3
                className="font-display text-ivory text-base sm:text-lg mb-3"
                style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
              >
                {job.qualificationsHeading ?? "Qualifications"}
              </h3>
              <ul className={`${p} list-disc pl-5 space-y-2`}>
                {job.qualifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-gold/15 px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            className="btn-gold text-sm w-full sm:w-auto"
            onClick={() => onApply(job.id)}
          >
            <span>Apply for this role</span>
          </button>
        </div>
      </div>
    </div>
  );
}
