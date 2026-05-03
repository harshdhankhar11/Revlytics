import Navbar from "../components/global/navbar";
import HeroSection from "../components/homepage/herosection";
import ProcessSection from "../components/homepage/processsection";
import FeaturesSection from "../components/homepage/featuressection";
import WhyRevlyticsSection from "../components/homepage/whyrevlyticssection";

export default function Home() {
  return (
    <div style={{ backgroundColor: "var(--background)" }}>
      <Navbar />
      <HeroSection />
      <ProcessSection />
      <FeaturesSection />
      <WhyRevlyticsSection />
    </div>
  );
}
