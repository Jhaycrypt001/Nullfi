import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  heading?: string;
  subheading?: string;
  faqs?: FAQItem[];
  className?: string;
}

export function FAQSection({
  heading = "Frequently Asked Questions",
  subheading = "Everything you need to know about Nullfi",
  faqs,
  className = "",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFAQs: FAQItem[] = [
    {
      question: "How do I get started with Nullfi?",
      answer:
        "Getting started is easy! Sign up for an account, connect your Sui wallet, and follow our quick start guide to deploy your first smart contract in minutes.",
    },
    {
      question: "What are the transaction fees?",
      answer:
        "Nullfi charges minimal transaction fees based on the Sui network. We offer flexible pricing tiers for different use cases, with volume discounts available.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we use military-grade encryption and multi-signature verification. All contracts undergo security audits before deployment.",
    },
    {
      question: "Do you offer API access?",
      answer:
        "Absolutely! We provide comprehensive REST and WebSocket APIs for developers to integrate Nullfi into their applications.",
    },
    {
      question: "What languages are supported?",
      answer:
        "We support Rust, JavaScript/TypeScript, Python, and Go with full SDKs and documentation available for each language.",
    },
    {
      question: "How do I get support?",
      answer:
        "We offer 24/7 support through Discord, email, and our documentation. Enterprise customers get dedicated support managers.",
    },
  ];

  const displayFAQs = faqs || defaultFAQs;

  return (
    <section className={`py-12 md:py-16 px-4 md:px-8 ${className}`}>
      <div className="container mx-auto max-w-2xl">
        <BlurFade delay={0.2} inView>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{heading}</h2>
            <p className="text-base text-gray-400">{subheading}</p>
          </div>
        </BlurFade>

        <div className="space-y-3">
          {displayFAQs.map((faq, index) => (
            <BlurFade key={index} delay={0.3 + index * 0.05} inView>
              <div className="border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-sm font-semibold text-white text-left">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-gray-400 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-4 py-3 bg-black/50 border-t border-white/10">
                    <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Contact support */}
        <BlurFade delay={0.5} inView>
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-4">
              Our team is here to help. Join our Discord community or reach out to support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Join Discord
              </a>
              <a
                href="mailto:support@nullfi.io"
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Email Support
              </a>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
