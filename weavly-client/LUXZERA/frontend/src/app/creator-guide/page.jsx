import CreatorGuidePage from "@/modules/designer/pages/CreatorGuidePage";

export const metadata = {
  title: "Creator Handbook & Publishing Guide — Weavly",
  description: "Step-by-step guide on how to become a verified designer and publish luxury couture lookbooks on Weavly.",
};

export default function CreatorGuideRoute() {
  return <CreatorGuidePage initialTab="become-creator" />;
}
