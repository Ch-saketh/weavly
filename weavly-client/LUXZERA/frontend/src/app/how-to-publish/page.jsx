import CreatorGuidePage from "@/modules/designer/pages/CreatorGuidePage";

export const metadata = {
  title: "How to Publish Your Design — Weavly Designer Studio",
  description: "Complete guide on drafting, configuring bespoke sizes, setting milestone escrow, and publishing lookbooks on Weavly.",
};

export default function HowToPublishRoute() {
  return <CreatorGuidePage initialTab="publish-design" />;
}
