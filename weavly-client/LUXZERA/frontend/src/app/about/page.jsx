"use client";

import { useRouter } from "next/navigation";
import AboutPage from "@/modules/system/pages/AboutPage";

export default function AboutRoute() {
  const router = useRouter();

  return <AboutPage onShopNow={() => router.push("/market")} />;
}





