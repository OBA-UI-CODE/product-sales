import ContactSection from "@/components/marketing/ContactSection";

/*
  Contact — Figma 146:8867 (web) / 146:8969 (tablet) / 146:9058 (mobile)

  Order per the file: Nav (layout) -> Contact section -> Footer (layout).
  There is no Final CTA or Trust strip on this page.

  Gap to the footer, measured from the file: 29 / 81 / 94
  (mobile 1015->1044, tablet 698->779, web 832->926).
*/
export default function ContactPage() {
  return (
    <div className="pb-[29px] tab:pb-[81px] web:pb-[94px]">
      <ContactSection />
    </div>
  );
}
