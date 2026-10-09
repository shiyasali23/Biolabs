import { headingCase } from "@/lib/heading-case";
import { formatNumber } from "@/lib/clinical-display";
export default function ConditionsTree({biochemicalsArray=[]}) {
 return <div className="divide-y rounded-lg border px-5">{biochemicalsArray.map((item,index)=><section key={item.id??index} className="py-5"><div className="flex justify-between flex-wrap gap-3"><h3 className="font-medium">{headingCase(item.name)}</h3><span className="text-sm tabular-nums">{formatNumber(item.value)} {item.unit}</span></div>{item.conditions?.length?<ul className="list-disc pl-5 mt-3 space-y-2 text-sm leading-6 text-[var(--biolabs-slate)]">{[...new Set(item.conditions)].map(condition=><li key={condition}>{condition}</li>)}</ul>:<p className="bio-caption mt-3">No condition associations were returned for this marker.</p>}</section>)}</div>;
}
