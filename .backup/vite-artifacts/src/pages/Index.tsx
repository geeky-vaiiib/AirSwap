import NavBar from "@/components/layout/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
