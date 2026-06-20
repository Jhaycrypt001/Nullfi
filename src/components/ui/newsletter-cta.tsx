import { useState } from "react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

interface NewsletterCTAProps {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export function NewsletterCTA({
  heading = "Join the Builder Community",
  subheading = "Get updates on new features, security audits, and exclusive developer resources",
  buttonText = "Join Now",
  placeholder = "Enter your email",
  className = "",
}: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email");
      return;
    }

    setStatus("loading");

    try {
      // Simulate API call - replace with your actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
      setMessage("Thanks for joining! Check your email for confirmation.");
      setEmail("");

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className={`py-20 md:py-32 px-4 md:px-8 ${className}`}>
      <div className="container mx-auto max-w-2xl">
        <BlurFade delay={0.2} inView>
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-8 md:p-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
              <p className="text-lg text-gray-400">{subheading}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    disabled={status === "loading"}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
                >
                  {status === "loading" ? "Joining..." : buttonText}
                </button>
              </div>

              {/* Status Messages */}
              {status === "success" && (
                <div className="flex items-center gap-2 text-green-400 mt-4">
                  <CheckCircle size={18} />
                  <span>{message}</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-red-400 mt-4">
                  <AlertCircle size={18} />
                  <span>{message}</span>
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>

            {/* Social Proof */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">10K+</p>
                  <p className="text-sm text-gray-400">Developers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$50M+</p>
                  <p className="text-sm text-gray-400">TVL Secured</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
