"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

const Field = ({ label, hint, required, children }) => (
  <label className="w-full space-y-8 text-sm opacity-60">
    <div className="flex items-center gap-6">
      <span className="flex items-center gap-6 capitalize">
        {label}
        {required && <span className="text-gold">*</span>}
      </span>
      {hint && <span className="text-xs text-black-400 font-normal">{hint}</span>}
    </div>
    {children}
  </label>
);

const CurrentOpeningsItem = ({ question, subheading, points, isOpen, onClick, onApply }) => {
  return (
    <div className={`faq-item border-b border-black-300 ${isOpen ? "is-open" : ""}`}>
      <button
        onClick={onClick}
        className="w-full py-30 px-0 flex flex-wrap justify-between items-center text-left transition-colors cursor-pointer"
      >
        <div className="flex flex-col max-w-[calc(100%_-_25px)]">
          <div className="content">
            <p className="mb-10">{subheading}</p>
          </div>
          <h3 className="h4">{question}</h3>
        </div>
        <div className="flex-shrink-0 w-15 h-15 relative">
          <svg
            className="faq-icon-plus w-15 h-15 absolute"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <svg
            className="faq-icon-minus w-15 h-15 absolute"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      </button>

      <div className="faq-content">
        <div className="content px-0 pb-40">
          <ul className="global-list grid gap-y-10">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <button type="button" className="btn mt-40" onClick={onApply}>
            <span className="btn-txt">
              Apply Now
              <span className="btn-txt-extra" data-txt="Apply Now"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

function ApplyModal({ isOpen, onClose }) {
  const router = useRouter();
  const modalRef = useRef(null);
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // `mounted` drives DOM presence; `enter` toggles `.open` one frame later so
  // the CSS transition actually runs. On close, we flip enter→false and
  // unmount after the transition completes. This is a legitimate
  // synchronize-with-DOM pattern, not derivable via useMemo since the
  // unmount needs to trail the prop flip by the transition duration.
  const [mounted, setMounted] = useState(false);
  const [enter, setEnter] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      const id = requestAnimationFrame(() => setEnter(true));
      return () => cancelAnimationFrame(id);
    }
    setEnter(false);
    const timeout = setTimeout(() => setMounted(false), 650);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
      const formId = process.env.NEXT_PUBLIC_CAREER_FORM_ID;
      if (!apiBase || !formId) {
        throw new Error("Missing NEXT_PUBLIC_WORDPRESS_API_URL or NEXT_PUBLIC_CAREER_FORM_ID");
      }

      const htmlForm = e.currentTarget;
      const values = new FormData(htmlForm);

      const payload = new FormData();
      payload.set("input_3", String(values.get("full_name") || ""));
      payload.set("input_5", String(values.get("email") || ""));
      payload.set("input_6", String(values.get("mobile") || ""));
      payload.set("input_7", String(values.get("dob") || ""));
      payload.set("input_8", String(values.get("gender") || ""));
      payload.set("input_10", String(values.get("total_experience") || ""));
      payload.set("input_11", String(values.get("current_company") || ""));
      payload.set("input_12", String(values.get("notice_period") || ""));
      payload.set("input_14", String(values.get("current_salary") || ""));
      payload.set("input_13", String(values.get("expected_salary") || ""));

      const resume = values.get("resume");
      if (resume instanceof File && resume.size > 0) {
        payload.set("input_9", resume);
      }

      const url = `${apiBase}/wp-json/gf/v2/forms/${formId}/submissions`;
      const response = await fetch(url, {
        method: "POST",
        body: payload,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(`Submission failed with status ${response.status}`);
      }
      if (result && result.is_valid === false) {
        const msg = result.validation_messages
          ? Object.values(result.validation_messages).filter(Boolean).join("\n")
          : "Form validation failed.";
        alert(msg);
        return;
      }

      htmlForm.reset();
      router.push("/thank-you?from=career");
    } catch (error) {
      console.error("Career form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;

    html.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("applyModalChange", { detail: { open: true } }));

    const preventWheel = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      e.preventDefault();
    };

    const preventTouch = (e) => {
      if (modalRef.current && modalRef.current.contains(e.target)) return;
      e.preventDefault();
    };

    const preventKeys = (e) => {
      const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      if (scrollKeys.includes(e.keyCode)) e.preventDefault();
    };

    window.addEventListener("wheel", preventWheel, { capture: true, passive: false });
    window.addEventListener("touchmove", preventTouch, { capture: true, passive: false });
    window.addEventListener("keydown", preventKeys, { capture: true });

    return () => {
      html.style.overflow = "";
      window.removeEventListener("wheel", preventWheel, { capture: true });
      window.removeEventListener("touchmove", preventTouch, { capture: true });
      window.removeEventListener("keydown", preventKeys, { capture: true });
      window.dispatchEvent(new CustomEvent("applyModalChange", { detail: { open: false } }));
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`apply-modal-overlay fixed inset-0 z-999999 bg-black-800/60 backdrop-blur-sm ${enter ? "open" : ""}`}
        onClick={onClose}
      />

      <div
        className={`apply-modal-panel fixed top-1/2 -translate-y-1/2 max-lg:left-1/2 max-lg:-translate-x-1/2 right-20 z-999999 h-[calc(100%_-_40px)]  w-full max-lg:max-w-[calc(100%_-_40px)] max-w-[calc(780px_-_40px)] flex flex-col overflow-hidden ${enter ? "open" : ""}`}
      >
        <div
          ref={modalRef}
          className="bg-black-700 relative py-40 px-25 overflow-y-auto h-full applyModal rounded-10"
        >
          <div className="fixed top-25 right-25 z-1">
            <button
              onClick={onClose}
              title="Close"
              className="size-32 flex items-center justify-center text-black-800 bg-white transition-colors rounded-10 cursor-pointer"
              aria-label="Close modal"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          <div className="w-full mb-40">
            <div className="flex items-center gap-10 mb-10">
              <Image
                src="/icons/ui/ring.gif"
                width={28}
                height={28}
                alt="ring"
                title="Encircle Technologies"
              />
              <div className="content">
                <p>Join Encircle</p>
              </div>
            </div>

            <div className="title title-white">
              <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>Apply Now</h2>
            </div>
          </div>

          <div className="w-full">
            <form ref={formRef} onSubmit={handleApplySubmit}>
              <div className="space-y-30 mb-30 py-30 border-y border-black-500">
                <div className="title title-white">
                  <h3 className="h6">Candidate Personal Details</h3>
                </div>
                <div className="grid grid-cols-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-30 gap-x-20">
                    <Field label="Full name" required>
                      <input
                        type="text"
                        className="apply-input"
                        placeholder="Enter your full name"
                        name="full_name"
                        required
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        type="email"
                        className="apply-input"
                        placeholder="Enter your email"
                        name="email"
                        required
                      />
                    </Field>
                    <Field label="Mobile number" required>
                      <input
                        type="number"
                        className="apply-input"
                        placeholder="Enter your mobile number"
                        name="mobile"
                        required
                      />
                    </Field>
                    <Field label="Date of Birth" required>
                      <input type="date" className="apply-input" name="dob" required />
                    </Field>
                    <Field label="Gender" required>
                      <select className="apply-input" name="gender" defaultValue="Male" required>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </Field>
                    <Field label="Resume" hint="(PNG, JPG, PDF, DOC)" required>
                      <input
                        type="file"
                        className="apply-input"
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                        name="resume"
                        required
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <div className="space-y-30 mb-40">
                <div className="title title-white">
                  <h3 className="h6">Employment Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-y-30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-30 gap-x-20">
                    <Field label="Total Experience" required>
                      <input
                        type="text"
                        className="apply-input"
                        placeholder="e.g., 3 years 4 months"
                        name="total_experience"
                        required
                      />
                    </Field>
                    <Field label="Current Company" required>
                      <input
                        type="text"
                        className="apply-input"
                        placeholder="Your current company"
                        name="current_company"
                        required
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-30 gap-x-20">
                    <Field label="Notice Period (Days)" required>
                      <input
                        type="number"
                        min="0"
                        className="apply-input"
                        placeholder="e.g., 30"
                        name="notice_period"
                        required
                      />
                    </Field>
                    <Field label="Current Salary (Monthly)" required>
                      <input
                        type="number"
                        min="0"
                        className="apply-input"
                        placeholder="Enter amount"
                        name="current_salary"
                        required
                      />
                    </Field>
                    <Field label="Expected Salary (Monthly)" required>
                      <input
                        type="number"
                        min="0"
                        className="apply-input"
                        placeholder="Enter amount"
                        name="expected_salary"
                        required
                      />
                    </Field>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn !w-full" disabled={isSubmitting}>
                <span className="btn-txt">
                  {isSubmitting ? "Submitting..." : "Submit"}
                  <span
                    className="btn-txt-extra"
                    data-txt={isSubmitting ? "Submitting..." : "Submit"}
                  ></span>
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default function JobOpeningAccordion({ data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  if (data?.hide_section === "yes") return null;

  const jobOpenings = data?.job_opening || [];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id={data?.extra_id || undefined}
      className={`faq-wrapper py-80 max-lg:py-40 ${data?.extra_class || ""}`}
    >
      <div className="container-fluid-xl">
        <div className="flex flex-wrap items-start justify-center max-lg:gap-40 gap-60 m-0 mx-auto p-0 w-full">
          <div className="w-full lg:flex-1">
            <div className="title title-white">
              <h2>{safeParse(data?.heading || "Our Current Openings")}</h2>
            </div>
          </div>
          <div className="w-full lg:flex-2">
            <div className="overflow-hidden">
              {jobOpenings.map((job, index) => (
                <CurrentOpeningsItem
                  key={index}
                  question={job.job_title}
                  subheading={job.job_experience}
                  points={job.skill_list?.map((item) => item.list_item) || []}
                  isOpen={openIndex === index}
                  onClick={() => handleToggle(index)}
                  onApply={openModal}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <ApplyModal isOpen={isModalOpen} onClose={closeModal} />
    </section>
  );
}
