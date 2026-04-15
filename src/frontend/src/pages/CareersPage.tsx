import { Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { Footer } from "../components/Footer";

const JOB_POSTINGS = [
  {
    id: "front-office",
    title: "Front Office Executive",
    location: "Nerul, Goa",
    type: "Full-time",
    summary:
      "Welcome guests, manage reservations, and coordinate with housekeeping. Prior hotel or retail front-desk experience preferred.",
  },
  {
    id: "housekeeping",
    title: "Housekeeping Supervisor",
    location: "Nerul, Goa",
    type: "Full-time",
    summary:
      "Lead room standards, train the team, and maintain inventory. Eye for detail and prior supervisory experience in hospitality.",
  },
  {
    id: "fnb",
    title: "F&B Service Associate",
    location: "Nerul, Goa",
    type: "Full-time",
    summary:
      "Support breakfast service and in-room dining. Warm guest presence; training provided for brand service standards.",
  },
  {
    id: "engineering",
    title: "Engineering Technician",
    location: "Nerul, Goa",
    type: "Full-time",
    summary:
      "HVAC, plumbing, and general property maintenance. Rotating shifts; certification in a trade is a plus.",
  },
] as const;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  roleId: string;
  message: string;
};

const initialForm = (): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  roleId: JOB_POSTINGS[0].id,
  message: "",
});

export function CareersPage() {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.title = "Careers | GHD Hotels";
  }, []);

  const p =
    "font-body text-sm sm:text-[0.95rem] text-ivory-muted/70 leading-relaxed";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCvFile(file);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError("Please enter your name and email.");
      return;
    }
    if (!form.roleId) {
      setFormError("Please select a position.");
      return;
    }
    if (!cvFile) {
      setFormError("Please attach your CV (PDF or Word).");
      return;
    }
    setStatus("loading");

    try {
      const selected =
        JOB_POSTINGS.find((j) => j.id === form.roleId)?.title ??
        (form.roleId === "general" ? "General interest" : "Role");

      const payload = new FormData();
      payload.set("fullName", form.fullName);
      payload.set("email", form.email);
      payload.set("phone", form.phone);
      payload.set("roleLabel", selected);
      payload.set("message", form.message);
      payload.set("cv", cvFile);

      const res = await fetch("/careers-apply", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Failed to submit application.");
      }

      setStatus("success");
      setForm(initialForm());
      setCvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setStatus("error");
      setFormError(
        err instanceof Error ? err.message : "Failed to submit application.",
      );
    }
  };

  const resetApplication = () => {
    setStatus("idle");
    setFormError("");
  };

  return (
    <div className="bg-charcoal min-h-screen flex flex-col">
      <section className="flex-1 section-pad pt-28 sm:pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <p className="eyebrow eyebrow--gold-emphasis mb-4">Careers</p>
            <div className="gold-divider mx-auto mb-8" />
            <h1
              className="font-display text-ivory text-3xl sm:text-4xl"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              Join GHD Hotels
            </h1>
          </div>

          <p className={`${p} text-center max-w-2xl mx-auto mb-12`}>
            We are growing our team across operations, guest experience, and
            support. Explore sample openings below and apply with your details
            and CV — this page is a demo; connect a backend when you are ready
            to receive real applications.
          </p>

          <h2
            className="font-display text-ivory text-xl sm:text-2xl mb-6 text-center sm:text-left"
            style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
          >
            Open positions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-14 sm:mb-16">
            {JOB_POSTINGS.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border border-gold/15 bg-black/25 p-5 sm:p-6 flex flex-col"
              >
                <h3
                  className="font-display text-ivory text-lg sm:text-xl mb-2"
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  {job.title}
                </h3>
                <p className="text-xs uppercase tracking-[0.16em] text-gold/85 mb-3">
                  {job.location} · {job.type}
                </p>
                <p className={`${p} flex-1`}>{job.summary}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-gold/15 bg-black/25 p-5 sm:p-8 md:p-10">
            <h2
              className="font-display text-ivory text-xl sm:text-2xl mb-2"
              style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
            >
              Apply
            </h2>
            <p className={`${p} mb-8`}>
              Share your details and upload your CV. Accepted formats: PDF,
              DOC, or DOCX (max 10 MB recommended).
            </p>

            {status === "success" ? (
              <div
                className="border border-gold/30 px-6 py-10 text-center"
                data-ocid="careers.success_state"
              >
                <div className="gold-divider max-w-xs mx-auto" />
                <p
                  className="font-display text-gold text-xl mt-6 mb-3"
                  style={{ fontFamily: "Instrument Serif, Georgia, serif" }}
                >
                  Application received
                </p>
                <p className={p}>Thank you. Our team will review and respond.</p>
                <button
                  type="button"
                  className="btn-gold mt-8 text-sm"
                  onClick={resetApplication}
                  data-ocid="careers.apply_again"
                >
                  <span>Submit another application</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate id={formId}>
                <div className="space-y-5 max-w-xl">
                  <div>
                    <label
                      htmlFor={`${formId}-name`}
                      className="eyebrow eyebrow--gold-emphasis block mb-2"
                    >
                      Full name *
                    </label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="ghd-input"
                      autoComplete="name"
                      required
                      data-ocid="careers.name.input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-email`}
                      className="eyebrow eyebrow--gold-emphasis block mb-2"
                    >
                      Email *
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="ghd-input"
                      autoComplete="email"
                      required
                      data-ocid="careers.email.input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-phone`}
                      className="eyebrow eyebrow--gold-emphasis block mb-2"
                    >
                      Phone
                    </label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className="ghd-input"
                      autoComplete="tel"
                      data-ocid="careers.phone.input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-role`}
                      className="eyebrow eyebrow--gold-emphasis block mb-2"
                    >
                      Position *
                    </label>
                    <select
                      id={`${formId}-role`}
                      name="roleId"
                      value={form.roleId}
                      onChange={handleChange}
                      className="ghd-input cursor-pointer"
                      required
                      data-ocid="careers.role.select"
                    >
                      {JOB_POSTINGS.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                      <option value="general">General interest</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`${formId}-message`}
                      className="eyebrow eyebrow--gold-emphasis block mb-2"
                    >
                      Cover note
                    </label>
                    <textarea
                      id={`${formId}-message`}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="A few lines about your experience and why you would like to join us"
                      rows={4}
                      className="ghd-input resize-none"
                      data-ocid="careers.message.textarea"
                    />
                  </div>

                  <div>
                    <span className="eyebrow eyebrow--gold-emphasis block mb-2">
                      CV / résumé *
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-ivory-muted/80 file:mr-4 file:rounded-lg file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-charcoal hover:file:bg-gold/30 cursor-pointer"
                      data-ocid="careers.cv.input"
                    />
                    {cvFile ? (
                      <p className="mt-2 text-xs text-ivory-muted/55">
                        Selected: {cvFile.name}
                      </p>
                    ) : null}
                  </div>

                  {formError ? (
                    <div
                      className="border border-red-500/30 px-4 py-3"
                      data-ocid="careers.error_state"
                    >
                      <p className="font-body text-red-400 text-sm">{formError}</p>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="btn-gold-filled w-full sm:w-auto min-w-[200px] disabled:opacity-60 disabled:cursor-not-allowed"
                    data-ocid="careers.submit"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border border-charcoal/40 border-t-charcoal rounded-full animate-spin" />
                        Sending…
                      </span>
                    ) : (
                      "Submit application"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className={`${p} text-center mt-10`}>
            <Link
              to="/contact"
              className="text-gold hover:text-gold/90 underline underline-offset-4"
            >
              Contact us
            </Link>{" "}
            for other enquiries.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
