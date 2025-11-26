import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import CaseStudies from "@/components/CaseStudies";
import Features from "@/components/Features";
import TechStack from "@/components/TechStack";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Stats />
      <Services />
      <CaseStudies />
      <Features />
      <TechStack />
      <Process />
      <Contact />
    </main>
  );
}
