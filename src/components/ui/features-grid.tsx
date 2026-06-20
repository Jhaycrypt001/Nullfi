import { BlurFade } from "@/components/ui/blur-fade";
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

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface FeaturesGridProps {
  heading?: string;
  subheading?: string;
  features?: Feature[];
  className?: string;
}

export function FeaturesGrid({
  heading = "Powerful Features for Builders",
  subheading = "Everything you need to build production-ready blockchain applications",
  features,
  className = "",
}: FeaturesGridProps) {
  const defaultFeatures: Feature[] = [
    {
      title: "Lightning Fast",
      description: "Deploy smart contracts in seconds with optimized transaction finality",
      icon: <Zap className="w-6 h-6" />,
      highlight: true,
    },
    {
      title: "Military Grade Security",
      description: "Battle-tested contracts with multi-signature support and formal verification",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "Real-Time Analytics",
      description: "Monitor transactions, gas usage, and contract health in real-time",
      icon: <Gauge className="w-6 h-6" />,
    },
    {
      title: "Developer Friendly",
      description: "Comprehensive APIs, SDKs, and documentation for all major languages",
      icon: <Code className="w-6 h-6" />,
    },
    {
      title: "Zero Downtime",
      description: "99.9% uptime SLA with automatic failover and redundancy",
      icon: <Lock className="w-6 h-6" />,
    },
    {
      title: "Scalable Infrastructure",
      description: "Handle millions of transactions per second without congestion",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Multi-Sig Support",
      description: "Enterprise-grade security with customizable signing thresholds",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "Mobile Ready",
      description: "Native mobile support with iOS and Android SDKs",
      icon: <Smartphone className="w-6 h-6" />,
    },
  ];

  const displayFeatures = features || defaultFeatures;

  return (
    <section className={`py-20 md:py-32 px-4 md:px-8 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <BlurFade delay={0.2} inView>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{heading}</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">{subheading}</p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayFeatures.map((feature, index) => (
            <BlurFade key={index} delay={0.3 + index * 0.05} inView>
              <div
                className={`relative group p-6 rounded-2xl transition-all duration-300 ${
                  feature.highlight
                    ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/60 shadow-lg shadow-blue-500/10"
                    : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    feature.highlight
                      ? "bg-gradient-to-br from-blue-600/30 to-purple-600/30"
                      : "bg-white/10"
                  }`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      feature.highlight
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-white/5 text-gray-300 group-hover:bg-white/10"
                    }`}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Highlight badge */}
                  {feature.highlight && (
                    <div className="mt-4 inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300 font-medium">
                      Most Popular
                    </div>
                  )}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
