import React, { useState } from "react";
import { parseWpHtml } from "@/utils/parseWpHtml";

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`faq-item border-b border-black-300 ${isOpen ? "is-open" : ""}`}>
      <button
        onClick={onClick}
        className="w-full py-30 px-0 flex justify-between items-center text-left transition-colors cursor-pointer"
      >
        <h3 className="h6">{question}</h3>
        <div className="flex-shrink-0 w-15 h-15 relative">
          <svg
            className="faq-icon-plus w-15 h-15 absolute inset-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <svg
            className="faq-icon-minus w-15 h-15 absolute inset-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      </button>

      <div className="faq-content">
        <div className="content px-0 pb-20">
          {typeof answer === "string" && answer.trim().startsWith("<") ? (
            parseWpHtml(answer)
          ) : (
            <p>{answer}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = ({ data }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const defaultFaqData = [
    {
      question: "How long does it take to develop a website?",
      answer:
        "The timeline varies based on project complexity, but most websites take 4-8 weeks from planning to launch.",
    },
    {
      question: "Will my website be mobile-friendly?",
      answer:
        "Yes, we design fully responsive websites that provide an optimal user experience across all devices and screen sizes.",
    },
    {
      question: "Do you provide ongoing support after the website is live?",
      answer:
        "Absolutely! We offer ongoing support, including updates, maintenance, and security checks to keep your site running smoothly.",
    },
    {
      question: "Do you offer custom web development solutions?",
      answer:
        "Yes, we specialize in custom web development tailored to your business needs for a unique and effective online presence.",
    },
    {
      question: "What services does your web development company offer?",
      answer:
        "We provide custom web design, e-commerce development, CMS solutions, SEO optimization, and ongoing maintenance services.",
    },
  ];

  const faqData = data && data.length > 0 ? data : defaultFaqData;

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="overflow-hidden">
      {faqData.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question || faq.heading}
          answer={faq.answer || faq.description}
          isOpen={openIndex === index}
          onClick={() => handleToggle(index)}
        />
      ))}
    </div>
  );
};

export default FAQAccordion;
