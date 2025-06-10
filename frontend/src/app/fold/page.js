"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Brain,
  Database,
  Zap,
  FlaskConical,
  Target,
  RefreshCw,
  ChevronRight,
  Activity,
  Atom,
  Dna,
  Beaker,
  CheckCircle,
  Clock,
  Play,
  Settings,
} from "lucide-react";

const BioAIResearchPlatform = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedHypothesis, setSelectedHypothesis] = useState(null);

  // Memoize stages to prevent unnecessary recalculations
  const stages = useMemo(() => [
    {
      id: 0,
      title: "Literature Mining",
      icon: Database,
      status: "completed",
      description: "PubMed & PMC Analysis",
      color: "bg-cyan-600",
    },
    {
      id: 1,
      title: "Hypothesis Generation",
      icon: Brain,
      status: "active",
      description: "LLaMA 3 + ChromaDB",
      color: "bg-blue-600",
    },
    {
      id: 2,
      title: "Symbolic Validation",
      icon: Zap,
      status: "pending",
      description: "PyDatalog + Z3 Logic",
      color: "bg-indigo-600",
    },
    {
      id: 3,
      title: "Multi-Modal Analysis",
      icon: Atom,
      status: "pending",
      description: "Molecular & Protein Modeling",
      color: "bg-purple-600",
    },
    {
      id: 4,
      title: "RL Experiment Planning",
      icon: Target,
      status: "pending",
      description: "PPO/DQN Optimization",
      color: "bg-pink-600",
    },
    {
      id: 5,
      title: "Wet Lab Integration",
      icon: FlaskConical,
      status: "pending",
      description: "Human-in-the-loop",
      color: "bg-red-600",
    },
  ], []);

  // Memoize hypotheses data
  const hypotheses = useMemo(() => [
    {
      id: 1,
      text: "BRCA1 mutations enhance p53-mediated apoptosis in triple-negative breast cancer",
      confidence: 0.92,
      sources: 1247,
      status: "validated",
    },
    {
      id: 2,
      text: "mTOR inhibition synergizes with autophagy induction in glioblastoma treatment",
      confidence: 0.87,
      sources: 892,
      status: "validating",
    },
    {
      id: 3,
      text: "CRISPR-Cas9 targeting of IDH1 mutations reverses glioma progression",
      confidence: 0.94,
      sources: 1556,
      status: "pending",
    },
  ], []);

  // Memoize molecules data
  const molecules = useMemo(() => [
    {
      name: "Compound A-1247",
      smiles: "CCO",
      admet: "High",
      drugLikeness: 0.85,
    },
    {
      name: "Inhibitor B-892",
      smiles: "CC(C)O",
      admet: "Medium",
      drugLikeness: 0.72,
    },
    {
      name: "Activator C-556",
      smiles: "C1CCCCC1",
      admet: "High",
      drugLikeness: 0.91,
    },
  ], []);

  // Optimized processing function
  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setProgress(0);
    
    // Use requestAnimationFrame for smoother animation
    let start = null;
    const duration = 3000;
    
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progressPercent = Math.min(elapsed / duration * 100, 100);
      
      setProgress(progressPercent);
      
      if (progressPercent < 100) {
        requestAnimationFrame(animate);
      } else {
        setIsProcessing(false);
        setCurrentStage(prev => Math.min(prev + 1, stages.length - 1));
      }
    };
    
    requestAnimationFrame(animate);
  }, [stages.length]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Simplified background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/20 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/20 bg-slate-900/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-cyan-600 rounded-xl">
                  <Dna className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    Bio Fold
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 text-cyan-400" />
                </button>
                <div className="px-3 py-1.5 bg-cyan-600/20 rounded-lg border border-cyan-500/30">
                  <span className="text-cyan-300 text-sm font-medium">
                    System Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Pipeline Overview */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Research Pipeline Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {stages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <div
                    className={`p-4 rounded-xl border transition-colors duration-300 cursor-pointer ${
                      stage.status === "completed"
                        ? "bg-emerald-600/20 border-emerald-500/30"
                        : stage.status === "active"
                        ? "bg-blue-600/20 border-blue-500/40"
                        : "bg-slate-800/40 border-slate-600/30"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2 rounded-lg ${stage.color}`}>
                        <stage.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-xs sm:text-sm">
                          {stage.title}
                        </h3>
                        <p className="text-cyan-300/60 text-xs mt-1">
                          {stage.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {stage.status === "completed" && (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                        {stage.status === "active" && (
                          <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                        )}
                        {stage.status === "pending" && (
                          <Clock className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  {index < stages.length - 1 && (
                    <ChevronRight className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-3 h-3 text-cyan-400 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hypothesis Generation Panel */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center space-x-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Generated Hypotheses</span>
                  </h3>
                  <button
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-1.5"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isProcessing ? "Processing..." : "Generate New"}
                    </span>
                  </button>
                </div>

                {isProcessing && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-cyan-300 text-xs">
                        Processing Literature...
                      </span>
                      <span className="text-cyan-300 text-xs">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {hypotheses.map((hypothesis) => (
                    <div
                      key={hypothesis.id}
                      onClick={() => setSelectedHypothesis(hypothesis)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedHypothesis?.id === hypothesis.id
                          ? "bg-blue-600/20 border-blue-500/40"
                          : "bg-slate-800/40 border-slate-600/30 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white text-xs leading-relaxed flex-1">
                          {hypothesis.text}
                        </p>
                        <div className="ml-2 flex items-center space-x-1.5">
                          {hypothesis.status === "validated" && (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          )}
                          {hypothesis.status === "validating" && (
                            <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
                          )}
                          {hypothesis.status === "pending" && (
                            <Clock className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-cyan-300 text-[0.65rem]">
                              Confidence:
                            </span>
                            <span className="text-white text-[0.65rem] font-medium">
                              {(hypothesis.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Database className="w-2.5 h-2.5 text-cyan-400" />
                            <span className="text-cyan-300 text-[0.65rem]">
                              {hypothesis.sources} sources
                            </span>
                          </div>
                        </div>
                        <div className="w-14 bg-slate-700 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1 rounded-full"
                            style={{ width: `${hypothesis.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Modal Analysis */}
              <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4">
                <h3 className="font-semibold text-white flex items-center space-x-1.5 mb-4">
                  <Atom className="w-4 h-4 text-purple-400" />
                  <span>Multi-Modal Analysis</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <Beaker className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-white text-xs font-medium">
                        Molecular
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {molecules.map((mol, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-purple-300">{mol.name}</span>
                            <span className="text-white">
                              {mol.drugLikeness}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <Dna className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-white text-xs font-medium">
                        Protein
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-300">AlphaFold Model</span>
                        <span className="text-emerald-400">Ready</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-300">3D Structure</span>
                        <span className="text-emerald-400">Loaded</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-300">Domains</span>
                        <span className="text-white">7 Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-600/20 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-white text-xs font-medium">
                        Docking
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-300">AutoDock</span>
                        <span className="text-white">-8.2 kcal/mol</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-300">GNINA Score</span>
                        <span className="text-white">0.87</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-300">Binding Affinity</span>
                        <span className="text-emerald-400">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-5">
              {/* System Status */}
              <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4">
                <h3 className="font-semibold text-white mb-3">
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-xs">GPU Clusters</span>
                    <span className="text-emerald-400 text-xs font-medium">
                      8/8 Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-xs">Memory Usage</span>
                    <span className="text-yellow-400 text-xs font-medium">
                      67%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-xs">
                      Processing Queue
                    </span>
                    <span className="text-white text-xs font-medium">
                      12 Jobs
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-xs">
                      Model Accuracy
                    </span>
                    <span className="text-emerald-400 text-xs font-medium">
                      94.2%
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4">
                <h3 className="font-semibold text-white mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-xs">Hypothesis validated</p>
                      <p className="text-cyan-300/60 text-[0.65rem]">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-xs">
                        Docking simulation completed
                      </p>
                      <p className="text-cyan-300/60 text-[0.65rem]">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white text-xs">
                        RL agent training started
                      </p>
                      <p className="text-cyan-300/60 text-[0.65rem]">8 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiment Planning */}
              <div className="bg-slate-800/60 rounded-xl border border-cyan-500/20 p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center space-x-1.5">
                  <FlaskConical className="w-4 h-4 text-orange-400" />
                  <span>Wet Lab Queue</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-2.5 bg-orange-600/20 rounded-lg border border-orange-500/30">
                    <p className="text-white text-xs font-medium">
                      Cell Viability Assay
                    </p>
                    <p className="text-orange-300 text-[0.65rem]">
                      Compound A-1247 • Priority: High
                    </p>
                  </div>
                  <div className="p-2.5 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                    <p className="text-white text-xs font-medium">
                      Protein Expression
                    </p>
                    <p className="text-yellow-300 text-[0.65rem]">
                      BRCA1 variant • Priority: Medium
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <p className="text-white text-xs font-medium">
                      Western Blot
                    </p>
                    <p className="text-blue-300 text-[0.65rem]">
                      p53 pathway • Priority: Low
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BioAIResearchPlatform;