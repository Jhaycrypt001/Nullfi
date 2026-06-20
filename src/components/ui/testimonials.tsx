import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BlurFade } from "@/components/ui/blur-fade";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  initials: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  heading?: string;
  testimonials?: Testimonial[];
  className?: string;
}

export function TestimonialsSection({
  heading = "Loved by Developers",
  testimonials = [],
  className = "",
}: TestimonialsSectionProps) {
  const defaultTestimonials: Testimonial[] = [
    {
      name: "Alex Chen",
      role: "Sui Developer",
      content:
        "Nullfi made it incredibly easy to deploy smart contracts on Sui. The tooling is production-ready.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      initials: "AC",
      rating: 5,
    },
    {
      name: "Sarah Williams",
      role: "Blockchain Architect",
      content:
        "The documentation and developer experience are exceptional. This is the future of blockchain development.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      initials: "SW",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Web3 Engineer",
      content:
        "Security audits passed immediately. Nullfi's infrastructure is solid and trustworthy.",
      avatar: "https://images.unsplash.com/photo-1516622927293-efb5873cfc71?w=100&h=100&fit=crop",
      initials: "MJ",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "DeFi Protocol Lead",
      content:
        "Deploying our DeFi protocol on Nullfi was seamless. Their support team is incredibly responsive.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461cea0be81?w=100&h=100&fit=crop",
      initials: "ER",
      rating: 5,
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className={`py-20 md:py-32 px-4 md:px-8 ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <BlurFade delay={0.2} inView>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{heading}</h2>
            <p className="text-xl text-gray-400">
              Join thousands of developers building on Sui with Nullfi
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayTestimonials.map((testimonial, index) => (
            <BlurFade key={index} delay={0.3 + index * 0.1} inView>
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
                {/* Rating Stars */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                )}

                {/* Testimonial Content */}
                <p className="text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-300">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
