import { Button } from "@/components/ui/button";
import {
  featuresData,
  howItWorksData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <section id="features" className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight" style={{ fontWeight: 700 }}>
              Built for the way money actually moves
            </h2>
            <p className="mt-3 text-muted-foreground text-lg">
              Fewer dashboards. Stronger signal. Tools that keep your books
              honest without the noise.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <article key={feature.title} className="group">
                <div className="mb-4 text-pine transition-transform duration-300 group-hover:-translate-y-0.5">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl text-ink" style={{ fontWeight: 700 }}>
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 sm:py-28 bg-mist/80 border-y border-border/70">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight text-center" style={{ fontWeight: 700 }}>
            Three steps to clarity
          </h2>
          <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
            From first account to AI-backed insight — without a learning curve.
          </p>

          <ol className="mt-16 grid gap-12 md:grid-cols-3">
            {howItWorksData.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="font-display text-5xl text-pine/25 absolute -top-6 -left-1 select-none" style={{ fontWeight: 700 }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="pt-8">
                  <h3 className="font-display text-xl text-ink" style={{ fontWeight: 700 }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="testimonials" className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-ink tracking-tight" style={{ fontWeight: 700 }}>
            Trusted by people who watch their numbers
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {testimonialsData.map((testimonial) => (
              <blockquote key={testimonial.name} className="border-l-2 border-pine/40 pl-5">
                <p className="text-foreground/90 leading-relaxed">
                  “{testimonial.quote}”
                </p>
                <footer className="mt-5 flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden py-24 sm:py-28 text-white"
        style={{ backgroundColor: "hsl(160 40% 8%)" }}
      >
        <div className="absolute inset-0 surface-grid opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-balance text-white" style={{ fontWeight: 700 }}>
            Start managing money with intention
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto text-lg">
            Join Welth and turn scattered transactions into a clear financial
            picture.
          </p>
          <Link to="/dashboard" className="inline-block mt-8">
            <Button
              size="lg"
              className="bg-white text-[hsl(160_40%_8%)] hover:bg-white/90 h-11 px-8 text-base font-semibold"
            >
              Start free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
