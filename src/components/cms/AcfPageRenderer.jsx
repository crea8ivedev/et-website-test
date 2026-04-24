import dynamic from "next/dynamic";
import { sanitizeExternalUrls } from "@/utils/sanitizeExternalUrls";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Above-fold sections — loaded eagerly (affect LCP)
import HeroBanner from "@/components/sections/common/HeroBanner";
import InnerBanner from "@/components/sections/common/InnerBanner";

// Below-fold sections — lazy loaded to reduce initial JS parse time
const WhoWeAre = dynamic(() => import("@/components/sections/home/WhoWeAre"), { ssr: true });
const ServiceList = dynamic(() => import("@/components/sections/services/ServiceList"), {
  ssr: true,
});
const FeaturedWork = dynamic(() => import("@/components/sections/home/FeaturedWork"), {
  ssr: true,
});
const Testimonial = dynamic(() => import("@/components/sections/common/Testimonial"), {
  ssr: true,
});
const EnhanceYourBusiness = dynamic(
  () => import("@/components/sections/marketing/EnhanceYourBusiness"),
  {
    ssr: true,
  }
);
const WebTechnologyLogoSlider = dynamic(
  () => import("@/components/sections/services/WebTechnologyLogoSlider"),
  { ssr: true }
);
const ExpertServices = dynamic(() => import("@/components/sections/home/ExpertServices"), {
  ssr: true,
});
const Accordion = dynamic(() => import("@/components/sections/common/Accordion"), { ssr: true });
const BenefitsPartnering = dynamic(
  () => import("@/components/sections/marketing/BenefitsPartnering"),
  {
    ssr: true,
  }
);
const WhyChooseEncircle = dynamic(() => import("@/components/sections/about/WhyChooseEncircle"), {
  ssr: true,
});
const DigitalSuccess = dynamic(() => import("@/components/sections/home/DigitalSuccess"), {
  ssr: true,
});
const FaqSection = dynamic(() => import("@/components/sections/common/FaqSection"), { ssr: true });
const TechnologyServices = dynamic(
  () => import("@/components/sections/services/TechnologyServices"),
  {
    ssr: true,
  }
);
const OurPerksAndBenefits = dynamic(
  () => import("@/components/sections/career/OurPerksAndBenefits"),
  {
    ssr: true,
  }
);
const OurRecruitmentProcess = dynamic(
  () => import("@/components/sections/career/OurRecruitmentProcess"),
  {
    ssr: true,
  }
);
const JobOpeningAccordion = dynamic(
  () => import("@/components/sections/career/JobOpeningAccordion"),
  {
    ssr: true,
  }
);
const BlogSection = dynamic(() => import("@/components/sections/common/BlogSection"), {
  ssr: true,
});
const TechnologyIntroSection = dynamic(
  () => import("@/components/sections/services/TechnologyIntroSection"),
  { ssr: true }
);
const TechnologyDevelopmentApproach = dynamic(
  () => import("@/components/sections/services/TechnologyDevelopmentApproach"),
  { ssr: true }
);
const TechnologyPerksAndBenefits = dynamic(
  () => import("@/components/sections/services/TechnologyPerksAndBenefits"),
  { ssr: true }
);
const TechnologyAgencyRightChoice = dynamic(
  () => import("@/components/sections/services/TechnologyAgencyRightChoice"),
  { ssr: true }
);
const ContactForm = dynamic(() => import("@/components/sections/common/ContactForm"), {
  ssr: true,
});
const VideoSection = dynamic(() => import("@/components/sections/common/VideoSection"), {
  ssr: true,
});
const ImageWithContent = dynamic(() => import("@/components/sections/marketing/ImageWithContent"), {
  ssr: true,
});
const KeyPainPoints = dynamic(() => import("@/components/sections/marketing/KeyPainPoints"), {
  ssr: true,
});
const OurAccessibility = dynamic(() => import("@/components/sections/marketing/OurAccessibility"), {
  ssr: true,
});
const MeasurableImpact = dynamic(() => import("@/components/sections/marketing/MeasurableImpact"), {
  ssr: true,
});
const ClientFeedback = dynamic(() => import("@/components/sections/marketing/ClientFeedback"), {
  ssr: true,
});
const IndustriesHelped = dynamic(() => import("@/components/sections/services/IndustriesHelped"), {
  ssr: true,
});
const BackgroundImageWithContent = dynamic(
  () => import("@/components/sections/marketing/BackgroundImageWithContent"),
  { ssr: true }
);
const PortfolioList = dynamic(() => import("@/components/sections/marketing/PortfolioList"), {
  ssr: true,
});
const ExperienceSection = dynamic(() => import("@/components/sections/about/ExperienceSection"), {
  ssr: true,
});
const MilestonesSection = dynamic(() => import("@/components/sections/home/MilestonesSection"), {
  ssr: true,
});
const VisionAndMission = dynamic(() => import("@/components/sections/about/VisionAndMission"), {
  ssr: true,
});
const EncircleGallery = dynamic(() => import("@/components/sections/about/EncircleGallery"), {
  ssr: true,
});
const CultureHighlights = dynamic(() => import("@/components/sections/about/CultureHighlights"), {
  ssr: true,
});
const JoinJourney = dynamic(() => import("@/components/sections/career/JoinJourney"), {
  ssr: true,
});
const InnovationWorkflow = dynamic(
  () => import("@/components/sections/marketing/InnovationWorkflow"),
  {
    ssr: true,
  }
);
const TransformativeSolutions = dynamic(
  () => import("@/components/sections/about/TransformativeSolutions"),
  { ssr: true }
);
const AccessibilityStatement = dynamic(
  () => import("@/components/sections/marketing/AccessibilityStatement"),
  { ssr: true }
);
const CompanyProfile = dynamic(() => import("@/components/company-profile/CompanyProfile"), {
  ssr: true,
});

const componentsMap = {
  hero_banner: HeroBanner,
  who_we_are: WhoWeAre,
  service_list: ServiceList,
  featured_work: FeaturedWork,
  testimonial: Testimonial,
  inner_banner: InnerBanner,
  enhance_your_business: EnhanceYourBusiness,
  web_technology_logo_slider: WebTechnologyLogoSlider,
  expert_services: ExpertServices,
  accordion: Accordion,
  benefits_of_partnering: BenefitsPartnering,
  why_choose_encircle: WhyChooseEncircle,
  digital_success_with_encircle: DigitalSuccess,
  faq_section: FaqSection,
  technology_services: TechnologyServices,
  our_perks_and_benefits: OurPerksAndBenefits,
  our_recruitment_process: OurRecruitmentProcess,
  job_opening_accordion: JobOpeningAccordion,
  blog_list: BlogSection,
  technology_intro_section: TechnologyIntroSection,
  technology_development_approach: TechnologyDevelopmentApproach,
  technology_perks_and_benefits: TechnologyPerksAndBenefits,
  technology_agency_right_choice: TechnologyAgencyRightChoice,
  contact_us_form: ContactForm,
  video_section: VideoSection,
  image_with_content: ImageWithContent,
  key_pain_points: KeyPainPoints,
  our_accessibility: OurAccessibility,
  the_measurable_impact: MeasurableImpact,
  client_feedback: ClientFeedback,
  industries_weve_helped: IndustriesHelped,
  background_image_with_content: BackgroundImageWithContent,
  portfolio_list: PortfolioList,
  experience_section: ExperienceSection,
  milestones_section: MilestonesSection,
  vision_and_mission: VisionAndMission,
  encircle_gallery: EncircleGallery,
  encircle_culture_highlights: CultureHighlights,
  join_the_journey_to_innovation: JoinJourney,
  innovation_workflow: InnovationWorkflow,
  transformative_solutions_section: TransformativeSolutions,
  legal_content: AccessibilityStatement,
  company_profile_tabs: CompanyProfile,
};

export default function PageRenderer({ pageData = [] }) {
  const rawSections = Array.isArray(
    pageData?.data?.acf?.page_content ||
      pageData?.data?.acf?.case_study_content ||
      pageData?.acf?.case_study_content
  )
    ? pageData.data?.acf?.page_content ||
      pageData?.data?.acf?.case_study_content ||
      pageData?.acf?.case_study_content
    : [];

  const sections = rawSections.map((section) => sanitizeExternalUrls(section));

  return (
    <>
      {sections.map((section, i) => {
        const Component = componentsMap[section.acf_fc_layout];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.error(section.acf_fc_layout, "Not Found");
          }
          return null;
        }

        return (
          <ErrorBoundary key={section.acf_fc_layout + "-" + i}>
            <Component data={section} />
          </ErrorBoundary>
        );
      })}
    </>
  );
}
