import AboutPreview from "./AboutPreview";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import RcCounter from "./RcCounter";
import SampleRCPreview from "./SampleRCPreview";
import WhyUseSection from "./WhyUseSection";
import VideoSection from "./VideoSection";
import FinalCTABanner from "./FinalCTABanner";
import TestimonialsSection from "./Testimonials";
import FeaturesOverview from "./Overview";
import Footer from "../../../components/layout/Footer";

export default function HomePage(){
  return (
    <>
    <HeroSection/>
   <FeaturesOverview/>
    <HowItWorks/>
    <WhyUseSection/>
    <SampleRCPreview/>
    <RcCounter/>
    <VideoSection/>
    <AboutPreview/>
    <TestimonialsSection/>
    <FinalCTABanner/>
    <Footer/>
    </>
  )
}