import { Suspense } from "react";
import ThankYouContent from "@/components/thank-you/ThankYouContent";

export const revalidate = false;

export const metadata = {
  title: "Thank You | Encircle Technologies",
  description: "Thank you for reaching out to Encircle Technologies.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <main className="relative z-1 bg-black-800 min-h-screen flex items-center justify-center py-80">
      <div className="container-fluid-lg">
        <Suspense fallback={null}>
          <ThankYouContent />
        </Suspense>
      </div>
    </main>
  );
}
