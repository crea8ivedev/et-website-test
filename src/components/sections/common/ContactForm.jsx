"use client";
import React, { useRef, useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/common/Reveal";
import { safeParse } from "@/utils/safeParse";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";

const LookingForOption = ({ id, label, value, onChange }) => {
  return (
    <label
      htmlFor={id}
      className="cta-check !flex items-center gap-15 cursor-pointer select-none relative !m-0"
    >
      <input
        id={id}
        type="radio"
        name="lookingFor"
        value={label}
        checked={value === label}
        onChange={(e) => onChange(e.target.value)}
        className="peer sr-only absolute size-0 inset-0"
      />

      <span className="size-32 border border-black-600/60 flex items-center justify-center">
        <svg
          className={`size-18 duration-200 ease-linear ${
            value === label ? "opacity-100" : "opacity-0"
          }`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" />
        </svg>
      </span>

      <span className="text-body-2 font-medium !text-white">{label}</span>
    </label>
  );
};

export default function ContactForm({ data, title }) {
  const [indiaTime, setIndiaTime] = useState("");
  const [isOfficeOpen, setIsOfficeOpen] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);
  const recaptchaWidgetId = useRef(null);
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState({
    input_4: "",
    input_6: "",
    input_8: "",
    input_9: "",
    input_10: "",
    input_11: "",
    input_12: "Design",
  });

  const [formError, setFormError] = useState({
    input_4: "",
    input_6: "",
    input_8: "",
    input_9: "",
    input_10: "",
    input_11: "",
    input_12: "",
  });

  const handleInputChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
    setFormError({
      ...formError,
      [field]: "",
    });
  };

  const validateEmail = (email) => {
    const pattern =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  const handleEmailBlur = (value) => {
    if (!validateEmail(value)) {
      setFormError({
        ...formError,
        input_6: value === "" ? "Please enter valid email." : "Please enter valid email.",
      });
    }
  };
  const handlePhoneBlur = (value) => {
    if (value === "") {
      setFormError((prev) => ({
        ...prev,
        input_9: "Please enter phone number.",
      }));
    } else if (!/^\d+$/.test(value)) {
      setFormError((prev) => ({
        ...prev,
        input_9: "Phone number should contain only digits.",
      }));
    } else if (value.length < 10 || value.length > 15) {
      setFormError((prev) => ({
        ...prev,
        input_9: "Phone number must be between 10 to 15 digits.",
      }));
    }
  };

  useEffect(() => {
    window.onContactRecaptchaLoad = () => {
      if (
        typeof window !== "undefined" &&
        window.grecaptcha?.render &&
        recaptchaRef.current &&
        !recaptchaRef.current.hasChildNodes()
      ) {
        try {
          recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
            theme: "dark",
          });
        } catch (err) {
          console.warn("reCAPTCHA render error", err);
        }
      }
    };
    if (typeof window !== "undefined" && window.grecaptcha?.render) {
      window.onContactRecaptchaLoad();
    }
  }, []);

  const handleSubmit = async () => {
    if (honeypot) return;

    const newErrors = {
      input_4: form.input_4 === "" ? "Please enter name." : "",
      input_6:
        form.input_6 === "" || !validateEmail(form.input_6) ? "Please enter valid email." : "",
      input_8: form.input_8 === "" ? "Please enter country name." : "",
      input_10: form.input_10 === "" ? "Please enter subject." : "",
      input_9:
        form.input_9 === ""
          ? "Please enter phone number."
          : !/^\d+$/.test(form.input_9)
            ? "Phone number should contain only digits."
            : form.input_9.length < 10 || form.input_9.length > 15
              ? "Phone number must be between 10 to 15 digits."
              : "",
      input_11: form.input_11 === "" ? "Please enter message." : "",
    };

    setFormError(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (!hasErrors) {
      let recaptchaToken = "";
      if (typeof window !== "undefined" && window.grecaptcha && recaptchaWidgetId.current != null) {
        recaptchaToken = window.grecaptcha.getResponse(recaptchaWidgetId.current);
      }
      if (!recaptchaToken) {
        setSubmitError("Please verify that you are not a robot.");
        return;
      }

      setIsLoading(true);
      setSubmitError("");

      const getCookie = (name) => {
        if (typeof document === "undefined") return "";
        const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : "";
      };

      const csrfToken = getCookie("__Host-et_csrf") || getCookie("et_csrf");

      const formId = process.env.NEXT_PUBLIC_CONTACT_FORM_ID;
      if (!formId) {
        setSubmitError("Form configuration is missing. Please contact support.");
        setIsLoading(false);
        return;
      }

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          formId,
          input_4: form.input_4,
          input_6: form.input_6,
          input_8: form.input_8,
          input_9: form.input_9,
          input_10: form.input_10,
          input_11: form.input_11,
          input_12: form.input_12,
          "g-recaptcha-response": recaptchaToken,
          recaptchaToken,
        }),
      };

      const url = `/api/gf-submit`;
      try {
        const response = await fetch(url, {
          ...requestOptions,
          signal: AbortSignal.timeout(10000),
        });
        const result = await response.json().catch(() => null);

        if (result && result.is_valid === false) {
          const validationMessage = result.validation_messages
            ? Object.values(result.validation_messages).filter(Boolean).join(" ")
            : "Please check the form details and try again.";
          setSubmitError(validationMessage);
          if (window.grecaptcha && recaptchaWidgetId.current != null) {
            window.grecaptcha.reset(recaptchaWidgetId.current);
          }
          return;
        }

        if (response.status === 200) {
          router.push("/thank-you?from=contact");
        } else {
          const serverMessage =
            result?.error ||
            result?.message ||
            (response.status === 403
              ? "Security check failed. Please refresh the page and try again."
              : `Submission failed (${response.status}). Please try again.`);
          setSubmitError(serverMessage);
          if (window.grecaptcha && recaptchaWidgetId.current != null) {
            window.grecaptcha.reset(recaptchaWidgetId.current);
          }
        }
      } catch (error) {
        console.error("Submission error:", error);
        const timeoutError = error?.name === "TimeoutError" || error?.name === "AbortError";
        setSubmitError(
          timeoutError
            ? "Request timed out. Please check your connection and try again."
            : "Something went wrong. Please try again or contact us directly."
        );
        if (
          typeof window !== "undefined" &&
          window.grecaptcha &&
          recaptchaWidgetId.current != null
        ) {
          window.grecaptcha.reset(recaptchaWidgetId.current);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("loader");
    } else {
      document.body.classList.remove("loader");
    }
    return () => document.body.classList.remove("loader");
  }, [isLoading]);

  useEffect(() => {
    const timeFormatter24 = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const tick = () => {
      const now = new Date();
      const parts = timeFormatter24.formatToParts(now);
      const time24 = parts.map((p) => p.value).join("");
      const hourStr = parts.find((p) => p.type === "hour")?.value;
      const minuteStr = parts.find((p) => p.type === "minute")?.value;
      const hour = Number.parseInt(hourStr, 10);
      const minute = Number.parseInt(minuteStr, 10);
      const dayPeriod = Number.isFinite(hour) ? (hour % 24 < 12 ? "AM" : "PM") : "";

      setIndiaTime(`${time24}${dayPeriod ? ` ${dayPeriod}` : ""}`);

      const totalMinutes = hour * 60 + minute;
      const openFrom = 10 * 60 + 30;
      const openTill = 19 * 60 + 30;
      setIsOfficeOpen(
        Number.isFinite(totalMinutes) ? totalMinutes >= openFrom && totalMinutes < openTill : null
      );
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  return (
    <section
      className={`contact-section pb-80 max-lg:pb-40 relative ${data.extra_class ? ` ${data.extra_class}` : ""}`}
      id={data?.extra_id || ""}
      aria-label={title}
    >
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onContactRecaptchaLoad"
        strategy="afterInteractive"
      />
      <div className="container-fluid">
        <div className="bg-black-700/70 rounded-10 px-15 py-25 md:p-40 lg:py-40 relative z-1 overflow-hidden">
          <div className="flex flex-wrap items-stretch justify-center gap-x-40 gap-y-30">
            <div className="left w-full lg:w-6/12 lg:pr-20 xl:p-0 xl:w-5/12 flex flex-col max-lg:order-1">
              <div className="flex flex-col justify-center items-center text-center gap-20 rounded-10 border border-black-500 max-lg:p-25 p-40 max-sm:mb-10 mb-20">
                <div className="flex gap-10 items-center justify-center uppercase">
                  {data?.pre_heading && (
                    <div className="content">
                      <span>{data.pre_heading}</span>
                    </div>
                  )}
                  {(() => {
                    const iconObj = data?.icons || data?.icon;
                    if (!iconObj) return null;

                    const iconSrc = typeof iconObj === "string" ? iconObj : iconObj.url;
                    if (!iconSrc) return null;

                    return (
                      <Image
                        src={iconSrc}
                        className="invert"
                        width={64}
                        height={64}
                        alt={iconObj?.alt || "icon"}
                      />
                    );
                  })()}
                  {data?.second_pre_heading && (
                    <div className="content">
                      <span>{data.second_pre_heading}</span>
                    </div>
                  )}
                </div>
                {data?.heading && (
                  <div className="title title-white">
                    <h2 className="h4">{safeParse(data.heading)}</h2>
                  </div>
                )}
                {data?.short_description && (
                  <div className="content">{safeParse(data.short_description)}</div>
                )}
              </div>
              <div className="flex flex-col items-start justify-start m-0 p-0 w-full max-sm:mb-10 mb-20">
                <div className="max-xl:size-30 max-xl:p-5 p-5 size-42 max-sm:hidden flex items-center justify-center border border-black-500 rounded-10">
                  <lord-icon
                    src="https://cdn.lordicon.com/mtuudzxm.json"
                    trigger="loop"
                    colors="primary:#ffffff,secondary:#ffffff"
                    className="size-full"
                  ></lord-icon>
                </div>
                <div className="flex flex-col max-sm:max-w-full max-sm:ml-0 max-xl:ml-30 ml-42 max-xl:max-w-[calc(100%_-_60px)] max-w-[calc(100%_-_84px)] w-full border border-black-500 rounded-10 overflow-hidden">
                  {data?.email_address && (
                    <div className="local-time border-b border-black-500 p-20 w-full text-center">
                      <Link
                        href={`mailto:${data.email_address}`}
                        aria-label="support@encircletechnologies.com"
                        className="max-sm:text-body-5 social-wrapper"
                      >
                        {data.email_address}
                      </Link>
                    </div>
                  )}
                  {data?.phone_number && (
                    <div className="ofc-open bg-black-500/20 p-20 w-full text-center">
                      <Link
                        href={`https://wa.me/${data.phone_number.replace(/\s+/g, "")}`}
                        aria-label="+91 8000 07 59 99"
                        target="_blank"
                        className="social-wrapper"
                      >
                        <span className="max-sm:text-body-1 text-3xl">{data.phone_number}</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start justify-start m-0 p-0 w-full max-sm:mb-10 mb-20">
                <div className="max-xl:size-30 max-xl:p-5 p-5 size-42 max-sm:hidden flex items-center justify-center border border-black-500 rounded-10">
                  <lord-icon
                    src="https://cdn.lordicon.com/warimioc.json"
                    trigger="loop"
                    colors="primary:#ffffff,secondary:#ffffff"
                    className="size-44"
                  ></lord-icon>
                </div>
                <div className="flex flex-col max-sm:max-w-full max-sm:ml-0 max-xl:ml-30 ml-42 max-xl:max-w-[calc(100%_-_60px)] max-w-[calc(100%_-_84px)] w-full border border-black-500 rounded-10 overflow-hidden">
                  {data?.ist_text && (
                    <div className="local-time border-b border-black-500 p-20 w-full">
                      <div className="flex flex-wrap items-center justify-center gap-5 text-heading-6 tracking-02">
                        <span>{data.ist_text}</span>
                        <span>{indiaTime || "--:--:--"}</span>
                      </div>
                    </div>
                  )}
                  <div className="ofc-open p-20 w-full text-center">
                    {data?.company_heading && (
                      <div className="content uppercase">
                        <p>{data.company_heading}</p>
                      </div>
                    )}
                    <div className="title title-white uppercase">
                      <h3
                        className={
                          isOfficeOpen == null
                            ? "text-white font-bold"
                            : isOfficeOpen
                              ? "text-gold"
                              : "text-white"
                        }
                      >
                        {isOfficeOpen == null ? "..." : isOfficeOpen ? "Open" : "Closed"}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap text-center border border-black-500 rounded-10 max-sm:max-w-full max-sm:ml-0 max-xl:ml-30 ml-42 max-xl:max-w-[calc(100%_-_60px)] max-w-[calc(100%_-_84px)]">
                {data?.hours_heading && (
                  <div className="border-b border-black-500 max-sm:px-10 p-20 w-full">
                    <div className="content uppercase">
                      <p>{data.hours_heading}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap w-full">
                  {data?.day_text && (
                    <div className="flex-1 border-r border-black-500">
                      <div className="content uppercase text-center max-sm:px-10 p-20">
                        <p>{data.day_text}</p>
                      </div>
                    </div>
                  )}
                  {data?.hours_text && (
                    <div className="flex-1">
                      <div className="content uppercase text-center max-sm:px-10 p-20">
                        <p>{data.hours_text}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-6/12 lg:pl-20 xl:p-0 max-lg:order-2">
              <form
                ref={formRef}
                className="contact-form grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-30 border border-black-500 bg-black-700/70 rounded-10 px-15 py-25 xl:p-40"
                onSubmit={(e) => e.preventDefault()}
              >
                <fieldset className="pb-30 border-b border-black-600 lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-0">
                    <div className="flex flex-col gap-20">
                      <LookingForOption
                        id="looking-design"
                        label="Design"
                        value={form.input_12}
                        onChange={(value) => handleInputChange("input_12", value)}
                      />

                      <LookingForOption
                        id="looking-web-dev"
                        label="Development"
                        value={form.input_12}
                        onChange={(value) => handleInputChange("input_12", value)}
                      />
                    </div>

                    <div className="flex flex-col gap-20">
                      <LookingForOption
                        id="looking-support"
                        label="Support"
                        value={form.input_12}
                        onChange={(value) => handleInputChange("input_12", value)}
                      />

                      <LookingForOption
                        id="looking-other"
                        label="Other"
                        value={form.input_12}
                        onChange={(value) => handleInputChange("input_12", value)}
                      />
                    </div>
                  </div>
                </fieldset>
                <div className="form-group">
                  <label htmlFor="name">
                    Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    id="name"
                    autoComplete="name"
                    aria-label="Name"
                    maxLength={100}
                    value={form.input_4}
                    onChange={(e) => handleInputChange("input_4", e.target.value)}
                  />
                  {formError.input_4 && (
                    <div className="error">
                      <span>{formError.input_4}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    aria-label="email"
                    maxLength={254}
                    value={form.input_6}
                    onBlur={(e) => handleEmailBlur(e.target.value)}
                    onChange={(e) => handleInputChange("input_6", e.target.value)}
                  />
                  {formError.input_6 && (
                    <div className="error">
                      <span>{formError.input_6}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="country">
                    Country <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Country"
                    name="country"
                    id="country"
                    autoComplete="country-name"
                    aria-label="country"
                    maxLength={100}
                    value={form.input_8}
                    onChange={(e) => handleInputChange("input_8", e.target.value)}
                  />
                  {formError.input_8 && (
                    <div className="error">
                      <span>{formError.input_8}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Phone <span>*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone"
                    name="phone"
                    id="phone"
                    autoComplete="tel"
                    aria-label="phone"
                    maxLength={15}
                    value={form.input_9}
                    onBlur={(e) => handlePhoneBlur(e.target.value)}
                    onChange={(e) =>
                      handleInputChange("input_9", e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                  {formError.input_9 && (
                    <div className="error">
                      <span>{formError.input_9}</span>
                    </div>
                  )}
                </div>

                <div className="form-group lg:col-span-2">
                  <label htmlFor="subject">
                    Subject <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Subject"
                    name="subject"
                    id="subject"
                    autoComplete="off"
                    aria-label="subject"
                    maxLength={200}
                    value={form.input_10}
                    onChange={(e) => handleInputChange("input_10", e.target.value)}
                  />
                  {formError.input_10 && (
                    <div className="error">
                      <span>{formError.input_10}</span>
                    </div>
                  )}
                </div>

                <div className="form-group lg:col-span-2">
                  <label htmlFor="message">
                    Message <span>*</span>
                  </label>
                  <textarea
                    placeholder="Message"
                    name="message"
                    id="message"
                    rows="5"
                    autoComplete="off"
                    maxLength={5000}
                    value={form.input_11}
                    aria-label="Message"
                    onChange={(e) => handleInputChange("input_11", e.target.value)}
                  ></textarea>
                  {formError.input_11 && (
                    <div className="error">
                      <span>{formError.input_11}</span>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <div ref={recaptchaRef} className="min-h-[78px]" />
                </div>

                <Reveal delay={300}>
                  <button
                    type="submit"
                    aria-label="Get a Quote"
                    className="btn mt-3"
                    onClick={handleSubmit}
                  >
                    <span className="btn-txt">
                      {isLoading ? "Sending..." : " Get a Quote"}
                      <span
                        className="btn-txt-extra"
                        data-txt={isLoading ? "Sending..." : " Get a Quote"}
                      ></span>
                    </span>
                  </button>
                </Reveal>
              </form>
              {submitError && (
                <div className="error mt-10">
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
