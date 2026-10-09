import ConditionsTree from "./ConditionsTree";

export default function HyperHypoConditions({ hyperBiochemicals, hypoBiochemicals }) {
  const empty = (label) => <div className="grid min-h-28 place-items-center bg-[var(--biolabs-porcelain)] p-5 text-center text-sm text-[var(--biolabs-slate)]">No {label.toLowerCase()} biochemical values.</div>;
  return <div className="grid items-start gap-6 lg:grid-cols-2"><section><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Above Range</h3><span className="bio-status-danger">Elevated</span></div>{!hyperBiochemicals?.length ? empty("Elevated") : <ConditionsTree biochemicalsArray={hyperBiochemicals} isHyper/>}</section><section><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Below Range</h3><span className="bio-status-warning">Reduced</span></div>{!hypoBiochemicals?.length ? empty("Reduced") : <ConditionsTree biochemicalsArray={hypoBiochemicals} isHyper={false}/>}</section></div>;
}
