"use client";
import useSWR from "swr";
import { getFAQ } from "@/lib/api/global.service";
import SectionTitle from "@/components/html/SectionTitle";

const fetcher = () => getFAQ();

export default function Faq() {
  // 20 minutes cache
  const { data, error, isLoading } = useSWR(
    "faq-data",
    fetcher,
    { dedupingInterval: 1200 * 1000, revalidateOnFocus: false }
  );

  return (
    <div className="container py-5">
      <SectionTitle first="Frequently" highlight="Asked Questions" />
      {isLoading && <div className="text-center py-5">Loading...</div>}
      {error && <div className="alert alert-danger">Failed to load FAQs.</div>}
      {data && (
        <div className="accordion" id="faqAccordion">
          {data.map((faq, idx) => (
            <div className="accordion-item" key={faq.id}>
              <h2 className="accordion-header" id={`heading${faq.id}`}>
                <button
                  className={`accordion-button${idx !== 0 ? " collapsed" : ""}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${faq.id}`}
                  aria-expanded={idx === 0 ? "true" : "false"}
                  aria-controls={`collapse${faq.id}`}
                >
                  <i className="fas fa-question-circle me-2"></i>
                  {faq.question}
                </button>
              </h2>
              <div
                id={`collapse${faq.id}`}
                className={`accordion-collapse collapse${idx === 0 ? " show" : ""}`}
                aria-labelledby={`heading${faq.id}`}
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
