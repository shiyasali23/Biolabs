import { headingCase } from "@/lib/heading-case";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import dynamic from "next/dynamic";
// Charts mount only inside an opened category, so chart.js loads on first open.
const BiochemicalLineGraph = dynamic(() => import("./BiochemicalLineGraph"), { ssr: false, loading: () => <div className="bio-card min-h-64" aria-hidden="true" /> });

export default function BiometricsAccordion({ biometrics }) {
  const categories = biometrics ? Object.keys(biometrics) : [];
  return <Accordion type="single" collapsible className="overflow-hidden border bg-white" style={{ borderColor: "var(--biolabs-cloud)", borderRadius: "var(--radius)" }}>{categories.map((category) => <AccordionItem key={category} value={category}><AccordionTrigger className="px-5 text-sm font-semibold hover:no-underline sm:px-7">{headingCase(category)}<span className="ml-auto mr-5 text-xs font-normal text-[var(--biolabs-slate)]">{Object.keys(biometrics[category]).length} markers</span></AccordionTrigger><AccordionContent className="grid grid-cols-2 gap-2 bg-[var(--biolabs-porcelain)] p-2 sm:gap-4 sm:p-4"><>{Object.entries(biometrics[category]).map(([name, biochemical]) => <BiochemicalLineGraph key={name} name={name} biochemical={biochemical}/>)}</></AccordionContent></AccordionItem>)}</Accordion>;
}
