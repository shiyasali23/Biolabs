"use client";
import { useEffect, useState } from "react";
import { Brain, Database, Zap, FlaskConical, Target, RefreshCw, ChevronRight, Activity, Atom, Dna, Beaker, CheckCircle, Clock, Play, Settings } from "lucide-react";

// Static demonstration content for the Bio Fold research preview.
const stages = [
  { title: "Literature Mining", icon: Database, status: "completed", description: "PubMed & PMC Analysis", color: "bg-cyan-600" },
  { title: "Hypothesis Generation", icon: Brain, status: "active", description: "LLaMA 3 + ChromaDB", color: "bg-blue-600" },
  { title: "Symbolic Validation", icon: Zap, status: "pending", description: "PyDatalog + Z3 Logic", color: "bg-indigo-600" },
  { title: "Multi-Modal Analysis", icon: Atom, status: "pending", description: "Molecular & Protein Modeling", color: "bg-purple-600" },
  { title: "RL Experiment Planning", icon: Target, status: "pending", description: "PPO/DQN Optimization", color: "bg-pink-600" },
  { title: "Wet Lab Integration", icon: FlaskConical, status: "pending", description: "Human-in-the-loop", color: "bg-red-600" },
];
const stageTone = {
  completed: "bg-emerald-600/20 border-emerald-500/30",
  active: "bg-blue-600/20 border-blue-500/40",
  pending: "bg-slate-800/40 border-slate-600/30",
};
const stageIcon = {
  completed: <CheckCircle className="w-3 h-3 text-emerald-400" />,
  active: <Activity className="w-3 h-3 text-blue-400 animate-pulse" />,
  pending: <Clock className="w-3 h-3 text-slate-400" />,
};

const hypotheses = [
  { id: 1, text: "BRCA1 mutations enhance p53-mediated apoptosis in triple-negative breast cancer", confidence: 0.92, sources: 1247, status: "validated" },
  { id: 2, text: "mTOR inhibition synergizes with autophagy induction in glioblastoma treatment", confidence: 0.87, sources: 892, status: "validating" },
  { id: 3, text: "CRISPR-Cas9 targeting of IDH1 mutations reverses glioma progression", confidence: 0.94, sources: 1556, status: "pending" },
];
const hypothesisIcon = {
  validated: <CheckCircle className="w-3 h-3 text-emerald-400" />,
  validating: <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />,
  pending: <Clock className="w-3 h-3 text-slate-400" />,
};

// [label, value, value color]
const analyses = [
  { title: "Molecular", icon: Beaker, box: "p-3 bg-purple-600/20 rounded-lg border border-purple-500/30", iconColor: "text-purple-400", labelColor: "text-purple-300",
    rows: [["Compound A-1247", 0.85, "text-white"], ["Inhibitor B-892", 0.72, "text-white"], ["Activator C-556", 0.91, "text-white"]] },
  { title: "Protein", icon: Dna, box: "p-3 bg-blue-600/20 rounded-lg border border-blue-500/30", iconColor: "text-blue-400", labelColor: "text-blue-300",
    rows: [["AlphaFold Model", "Ready", "text-emerald-400"], ["3D Structure", "Loaded", "text-emerald-400"], ["Domains", "7 Active", "text-white"]] },
  { title: "Docking", icon: Target, box: "p-3 bg-emerald-600/20 rounded-lg border border-emerald-500/30", iconColor: "text-emerald-400", labelColor: "text-emerald-300",
    rows: [["AutoDock", "-8.2 kcal/mol", "text-white"], ["GNINA Score", "0.87", "text-white"], ["Binding Affinity", "High", "text-emerald-400"]] },
];
const systemStatus = [
  ["GPU Clusters", "8/8 Active", "text-emerald-400"],
  ["Memory Usage", "67%", "text-yellow-400"],
  ["Processing Queue", "12 Jobs", "text-white"],
  ["Model Accuracy", "94.2%", "text-emerald-400"],
];
const activity = [
  ["bg-emerald-400", "Hypothesis validated", "2 minutes ago"],
  ["bg-blue-400", "Docking simulation completed", "5 minutes ago"],
  ["bg-yellow-400", "RL agent training started", "8 minutes ago"],
];
const wetLab = [
  ["p-2.5 bg-orange-600/20 rounded-lg border border-orange-500/30", "text-orange-300", "Cell Viability Assay", "Compound A-1247 • Priority: High"],
  ["p-2.5 bg-yellow-600/20 rounded-lg border border-yellow-500/30", "text-yellow-300", "Protein Expression", "BRCA1 variant • Priority: Medium"],
  ["p-2.5 bg-blue-600/20 rounded-lg border border-blue-500/30", "text-blue-300", "Western Blot", "p53 pathway • Priority: Low"],
];
const panel = "bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4";

// Owns the per-frame progress state so a run re-renders only this bar, and stops if the page unmounts.
function ProcessingProgress({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame, start;
    const tick = (now) => {
      start ??= now;
      const value = Math.min((now - start) / 30, 100); // 3 s
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
      else onDone(false);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-cyan-300 text-xs">Processing Literature...</span>
        <span className="text-cyan-300 text-xs">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

export default function BioAIResearchPlatform() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/20 pointer-events-none"></div>

      <div className="relative z-10">
        <header className="border-b border-cyan-500/20 bg-slate-900/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-600 rounded-xl">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">Bio Fold</h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-cyan-400" />
                </button>
                <div className="px-3 py-1.5 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
                  <span className="text-cyan-300 text-sm font-medium">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Research Pipeline Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {stages.map((stage, index) => (
                <div key={stage.title} className="relative">
                  <div className={`p-4 rounded-xl border transition-colors duration-300 cursor-pointer ${stageTone[stage.status]}`}>
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2 rounded-lg ${stage.color}`}>
                        <stage.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-xs sm:text-sm">{stage.title}</h3>
                        <p className="text-cyan-300/60 text-xs mt-1">{stage.description}</p>
                      </div>
                      <div className="flex items-center space-x-1">{stageIcon[stage.status]}</div>
                    </div>
                  </div>
                  {index < stages.length - 1 && (
                    <ChevronRight className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-3 h-3 text-cyan-400 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className={panel}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center space-x-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Generated Hypotheses</span>
                  </h3>
                  <button
                    onClick={() => setIsProcessing(true)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-1.5"
                  >
                    {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isProcessing ? "Processing..." : "Generate New"}</span>
                  </button>
                </div>

                {isProcessing && <ProcessingProgress onDone={setIsProcessing} />}

                <div className="space-y-3">
                  {hypotheses.map((hypothesis) => (
                    <div
                      key={hypothesis.id}
                      onClick={() => setSelectedId(hypothesis.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedId === hypothesis.id ? "bg-blue-600/20 border-blue-500/40" : "bg-slate-800/40 border-slate-600/30 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-xs leading-relaxed flex-1">{hypothesis.text}</p>
                        <div className="ml-2 flex items-center space-x-1.5">{hypothesisIcon[hypothesis.status]}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-cyan-300 text-[0.65rem]">Confidence:</span>
                            <span className="text-white text-[0.65rem] font-medium">{(hypothesis.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-cyan-300 text-[0.65rem]">{hypothesis.sources} sources</span>
                          </div>
                        </div>
                        <div className="w-14 bg-slate-700 rounded-full h-1">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1 rounded-full" style={{ width: `${hypothesis.confidence * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={panel}>
                <h3 className="font-semibold text-white flex items-center space-x-1.5 mb-4">
                  <Atom className="w-4 h-4 text-purple-400" />
                  <span>Multi-Modal Analysis</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {analyses.map(({ title, icon: Icon, box, iconColor, labelColor, rows }) => (
                    <div key={title} className={box}>
                      <div className="flex items-center space-x-1.5 mb-2">
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        <span className="text-white text-xs font-medium">{title}</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {rows.map(([label, value, valueColor]) => (
                          <div key={label} className="flex justify-between">
                            <span className={labelColor}>{label}</span>
                            <span className={valueColor}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className={panel}>
                <h3 className="font-semibold text-white mb-3">System Status</h3>
                <div className="space-y-3">
                  {systemStatus.map(([label, value, color]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-cyan-300 text-xs">{label}</span>
                      <span className={`${color} text-xs font-medium`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={panel}>
                <h3 className="font-semibold text-white mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {activity.map(([dot, text, time]) => (
                    <div key={text} className="flex items-start space-x-2">
                      <div className={`w-1.5 h-1.5 ${dot} rounded-full mt-2`}></div>
                      <div>
                        <p className="text-white text-xs">{text}</p>
                        <p className="text-cyan-300/60 text-[0.65rem]">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={panel}>
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-1.5">
                  <FlaskConical className="w-4 h-4 text-orange-400" />
                  <span>Wet Lab Queue</span>
                </h3>
                <div className="space-y-2">
                  {wetLab.map(([box, detailColor, title, detail]) => (
                    <div key={title} className={box}>
                      <p className="text-white text-xs font-medium">{title}</p>
                      <p className={`${detailColor} text-[0.65rem]`}>{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
