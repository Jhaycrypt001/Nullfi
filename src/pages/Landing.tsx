import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Footer } from "@/components/ui/footer-section";
import { Feature } from "@/components/ui/feature-with-image-comparison";
import NavHeader from "@/components/ui/nav-header";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { BlurFade } from "@/components/ui/blur-fade";
import { TestimonialsSection } from "@/components/ui/testimonials";
import { NewsletterCTA } from "@/components/ui/newsletter-cta";
import { FeaturesGrid } from "@/components/ui/features-grid";
import { FAQSection } from "@/components/ui/faq-section";
import {
  Zap,
  Shield,
  Gauge,
  Code,
  Lock,
  TrendingUp,
  CheckCircle,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden pt-20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <NavHeader />
      </nav>

      {/* 1. HERO SECTION */}
      <section id="home" className="pb-32">
        <HeroGeometric
          badge="Sui Blockchain"
          title1="Build with"
          title2="Nullfi"
        />
      </section>

      {/* 2. WHY CHOOSE - Cards */}
      <section id="features" className="py-6 px-4 md:px-8">
        <div className="flex justify-center">
          <BlurFade delay={0.2} inView>
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6 w-full">
              Why Choose Nullfi?
            </h2>
          </BlurFade>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {[
            {
              title: "Fast Deployment",
              description: "Deploy contracts in seconds with optimized infrastructure",
              icon: "⚡",
            },
            {
              title: "Enterprise Security",
              description: "Military-grade encryption and multi-signature support",
              icon: "🔐",
            },
            {
              title: "24/7 Support",
              description: "Dedicated support team ready to help you succeed",
              icon: "🤝",
            },
          ].map((feature, i) => (
            <BlurFade key={i} delay={0.3 + i * 0.1} inView>
              <div style={{ width: "347px", height: "260.25px" }} className="flex">
                <GlowCard
                  glowColor="blue"
                  size="md"
                  className="flex flex-col items-center justify-center p-4 text-center w-full"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                </GlowCard>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section className="py-8 px-4 md:px-8 bg-gradient-to-b from-transparent to-purple-950/10">
        <FeaturesGrid
          heading="Complete Feature Set"
          subheading="Everything you need to build, deploy, and scale on Sui"
          features={[
            {
              title: "Fast Transactions",
              description: "Deploy and execute smart contracts in milliseconds with Sui's optimized architecture",
              icon: <Zap className="w-6 h-6" />,
            },
            {
              title: "Security First",
              description: "Enterprise-grade security with Move language safety and formal verification",
              icon: <Shield className="w-6 h-6" />,
            },
            {
              title: "Real-Time Monitoring",
              description: "Track transactions, costs, and performance metrics in real-time",
              icon: <Gauge className="w-6 h-6" />,
            },
            {
              title: "Developer Friendly",
              description: "Comprehensive APIs, SDKs, and documentation for easy integration",
              icon: <Code className="w-6 h-6" />,
            },
            {
              title: "High Availability",
              description: "99.9% uptime with automatic failover and geographic redundancy",
              icon: <Lock className="w-6 h-6" />,
            },
            {
              title: "Scalable",
              description: "Handle millions of transactions per second without network congestion",
              icon: <TrendingUp className="w-6 h-6" />,
            },
            {
              title: "Multi-Signature",
              description: "Enterprise security with customizable signing thresholds and approval workflows",
              icon: <CheckCircle className="w-6 h-6" />,
            },
            {
              title: "Cross-Platform",
              description: "Native support for web, mobile, and backend integration",
              icon: <Smartphone className="w-6 h-6" />,
            },
          ]}
        />
      </section>

      {/* 5. IMAGE COMPARISON - DOCS */}
      <section id="docs" className="py-6 px-4 md:px-8">
        <Feature />
      </section>

      {/* 6. SCROLL PARALLAX */}
      <section className="py-6 px-4 md:px-8">
        <ContainerScroll
          titleComponent={
            <BlurFade inView>
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Developer Experience
                </h2>
                <p className="text-sm text-gray-400">
                  Intuitive tools for building on Sui
                </p>
              </div>
            </BlurFade>
          }
        >
          <img
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop"
            alt="Developer Dashboard"
            className="rounded-lg w-full h-auto object-cover"
          />
        </ContainerScroll>
      </section>

      {/* 7. DEMO SECTION */}
      <section className="py-8 px-4 md:px-8 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <BlurFade inView>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              Platform in Action
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm">
              Watch how Nullfi makes smart contract deployment simple
            </p>
          </BlurFade>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Smart Contract Deployment",
                description: "Deploy your first contract in minutes with Nullfi's intuitive interface",
              },
              {
                title: "Real-Time Monitoring",
                description: "Track transaction status, gas costs, and contract performance live",
              },
              {
                title: "Security Testing",
                description: "Built-in security checks and formal verification for peace of mind",
              },
              {
                title: "Developer Tools",
                description: "Comprehensive APIs and SDKs for seamless integration",
              },
            ].map((item, i) => (
              <BlurFade key={i} delay={0.1 * i} inView>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS - COMMUNITY */}
      <section id="community" className="py-8 px-4 md:px-8">
        <TestimonialsSection
          heading="Loved by Developers Worldwide"
        />
      </section>

      {/* 9. FAQ */}
      <section className="py-8 px-4 md:px-8 bg-gradient-to-b from-transparent to-purple-950/10">
        <FAQSection
          heading="Frequently Asked Questions"
          subheading="Everything you need to know about Nullfi"
        />
      </section>

      {/* 10. NEWSLETTER - CONTACT */}
      <section id="contact" className="py-8 px-4 md:px-8">
        <div className="flex justify-center">
          <div style={{ width: "612.97px", height: "633.33px" }} className="flex">
            <GlowCard
              glowColor="blue"
              size="md"
              className="flex flex-col items-center justify-center p-8 w-full"
            >
              <BlurFade inView>
                <div className="text-center w-full">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                    Ready to Build?
                  </h2>
                  <p className="text-sm text-gray-400 mb-6">
                    Join thousands of developers building on Sui
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Handle submission
                    }}
                    className="space-y-4 w-full"
                  >
                    <div className="flex flex-col gap-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all text-sm"
                      >
                        Get Started
                      </button>
                    </div>
                  </form>

                  <p className="text-xs text-gray-500 mt-4">
                    No credit card required. Start deploying in minutes.
                  </p>
                </div>
              </BlurFade>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <Footer />
    </main>
  );
}
