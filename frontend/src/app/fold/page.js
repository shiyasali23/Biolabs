"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Database, Zap, FlaskConical, Target, RefreshCw, ChevronRight, Activity, Atom, Dna, Beaker, CheckCircle, Clock, Play, Settings } from 'lucide-react';

// Memoized icon components for better performance
const MemoizedIcon = React.memo(({ Icon, className }) => <Icon className={className} />);

// Memoized stage component
const StageCard = React.memo(({ stage, index, stagesLength }) => (
  <div className="relative">
    <div className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer will-change-transform hover:scale-105 ${
      stage.status === 'completed' ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30' :
      stage.status === 'active' ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/40 shadow-lg shadow-cyan-500/20' :
      'bg-gradient-to-br from-slate-800/40 to-slate-700/40 border-slate-600/30'
    }`}>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${stage.color}`}>
          <MemoizedIcon Icon={stage.icon} className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-white text-sm">{stage.title}</h3>
          <p className="text-cyan-300/60 text-xs mt-1">{stage.description}</p>
        </div>
        <div className="flex items-center space-x-1">
          {stage.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
          {stage.status === 'active' && <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />}
          {stage.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
    </div>
    {index < stagesLength - 1 && (
      <ChevronRight className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 text-cyan-400 hidden lg:block" />
    )}
  </div>
));

// Memoized hypothesis card
const HypothesisCard = React.memo(({ hypothesis, isSelected, onSelect }) => (
  <div 
    onClick={() => onSelect(hypothesis)}
    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 will-change-transform hover:scale-[1.01] ${
      isSelected 
        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40' 
        : 'bg-slate-800/40 border-slate-600/30 hover:border-cyan-500/30'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-white text-sm leading-relaxed flex-1">{hypothesis.text}</p>
      <div className="ml-4 flex items-center space-x-2">
        {hypothesis.status === 'validated' && <CheckCircle className="w-4 h-4 text-green-400" />}
        {hypothesis.status === 'validating' && <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />}
        {hypothesis.status === 'pending' && <Clock className="w-4 h-4 text-slate-400" />}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-cyan-300">Confidence:</span>
          <span className="text-xs font-medium text-white">{(hypothesis.confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <Database className="w-3 h-3 text-cyan-400" />
          <span className="text-xs text-cyan-300">{hypothesis.sources} sources</span>
        </div>
      </div>
      <div className="w-16 bg-slate-700 rounded-full h-1">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1 rounded-full transition-all duration-300"
          style={{ width: `${hypothesis.confidence * 100}%` }}
        />
      </div>
    </div>
  </div>
));

const Fold = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedHypothesis, setSelectedHypothesis] = useState(null);

  // Memoized static data to prevent re-creation on renders
  const stages = useMemo(() => [
    {
      id: 0,
      title: "Literature Mining",
      icon: Database,
      status: "completed",
      description: "PubMed & PMC Analysis",
      color: "from-cyan-500 to-blue-600"
    },
    {
      id: 1,
      title: "Hypothesis Generation",
      icon: Brain,
      status: "active",
      description: "LLaMA 3 + ChromaDB",
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "Symbolic Validation",
      icon: Zap,
      status: "pending",
      description: "PyDatalog + Z3 Logic",
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: 3,
      title: "Multi-Modal Analysis",
      icon: Atom,
      status: "pending",
      description: "Molecular & Protein Modeling",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      title: "RL Experiment Planning",
      icon: Target,
      status: "pending",
      description: "PPO/DQN Optimization",
      color: "from-pink-500 to-red-600"
    },
    {
      id: 5,
      title: "Wet Lab Integration",
      icon: FlaskConical,
      status: "pending",
      description: "Human-in-the-loop",
      color: "from-red-500 to-orange-600"
    }
  ], []);

  const hypotheses = useMemo(() => [
    {
      id: 1,
      text: "BRCA1 mutations enhance p53-mediated apoptosis in triple-negative breast cancer",
      confidence: 0.92,
      sources: 1247,
      status: "validated"
    },
    {
      id: 2,
      text: "mTOR inhibition synergizes with autophagy induction in glioblastoma treatment",
      confidence: 0.87,
      sources: 892,
      status: "validating"
    },
    {
      id: 3,
      text: "CRISPR-Cas9 targeting of IDH1 mutations reverses glioma progression",
      confidence: 0.94,
      sources: 1556,
      status: "pending"
    }
  ], []);

  const molecules = useMemo(() => [
    { name: "Compound A-1247", smiles: "CCO", admet: "High", drugLikeness: 0.85 },
    { name: "Inhibitor B-892", smiles: "CC(C)O", admet: "Medium", drugLikeness: 0.72 },
    { name: "Activator C-556", smiles: "C1CCCCC1", admet: "High", drugLikeness: 0.91 }
  ], []);

  // Optimized progress animation with RAF
  useEffect(() => {
    if (!isProcessing) return;
    
    let animationId;
    const animate = () => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1.5;
      });
      if (progress < 100) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isProcessing, progress]);

  // Memoized callbacks to prevent re-renders
  const handleSelectHypothesis = useCallback((hypothesis) => {
    setSelectedHypothesis(hypothesis);
  }, []);

  const startProcessing = useCallback(() => {
    setIsProcessing(true);
    setProgress(0);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStage(prev => Math.min(prev + 1, stages.length - 1));
    }, 3000);
  }, [stages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 transform-gpu">
      {/* Optimized Background - Reduced animations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Optimized Header */}
        <header className="sticky top-0 z-50 border-b border-cyan-500/20 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  Bio Fold
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors duration-200">
                  <Settings className="w-5 h-5 text-cyan-400" />
                </button>
                <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30">
                  <span className="text-cyan-300 font-medium">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Pipeline Overview */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Research Pipeline Status</h2>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {stages.map((stage, index) => (
                <StageCard 
                  key={stage.id} 
                  stage={stage} 
                  index={index} 
                  stagesLength={stages.length}
                />
              ))}
            </div>
          </section>

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Hypothesis Generation Panel */}
            <section className="xl:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    <span>Generated Hypotheses</span>
                  </h3>
                  <button 
                    onClick={startProcessing}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{isProcessing ? 'Processing...' : 'Generate New'}</span>
                  </button>
                </div>

                {isProcessing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-cyan-300">Processing Literature...</span>
                      <span className="text-sm text-cyan-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {hypotheses.map((hypothesis) => (
                    <HypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      isSelected={selectedHypothesis?.id === hypothesis.id}
                      onSelect={handleSelectHypothesis}
                    />
                  ))}
                </div>
              </div>

              {/* Multi-Modal Analysis */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2 mb-6">
                  <Atom className="w-5 h-5 text-purple-400" />
                  <span>Multi-Modal Analysis</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                    <div className="flex items-center space-x-2 mb-3">
                      <Beaker className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Molecular</span>
                    </div>
                    <div className="space-y-2">
                      {molecules.map((mol, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-purple-300">{mol.name}</span>
                            <span className="text-white">{mol.drugLikeness}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                    <div className="flex items-center space-x-2 mb-3">
                      <Dna className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Protein</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-300">AlphaFold Model</span>
                        <span className="text-green-400">Ready</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-300">3D Structure</span>
                        <span className="text-green-400">Loaded</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-300">Domains</span>
                        <span className="text-white">7 Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Docking</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-green-300">AutoDock</span>
                        <span className="text-white">-8.2 kcal/mol</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">GNINA Score</span>
                        <span className="text-white">0.87</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-300">Binding Affinity</span>
                        <span className="text-green-400">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Side Panel */}
            <aside className="space-y-6">
              {/* System Status */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-sm">GPU Clusters</span>
                    <span className="text-green-400 text-sm font-medium">8/8 Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-sm">Memory Usage</span>
                    <span className="text-yellow-400 text-sm font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-sm">Processing Queue</span>
                    <span className="text-white text-sm font-medium">12 Jobs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 text-sm">Model Accuracy</span>
                    <span className="text-green-400 text-sm font-medium">94.2%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">Hypothesis validated</p>
                      <p className="text-cyan-300/60 text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">Docking simulation completed</p>
                      <p className="text-cyan-300/60 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm">RL agent training started</p>
                      <p className="text-cyan-300/60 text-xs">8 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experiment Planning */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FlaskConical className="w-5 h-5 text-orange-400" />
                  <span>Wet Lab Queue</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <p className="text-white text-sm font-medium">Cell Viability Assay</p>
                    <p className="text-orange-300 text-xs">Compound A-1247 • Priority: High</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <p className="text-white text-sm font-medium">Protein Expression</p>
                    <p className="text-yellow-300 text-xs">BRCA1 variant • Priority: Medium</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-white text-sm font-medium">Western Blot</p>
                    <p className="text-blue-300 text-xs">p53 pathway • Priority: Low</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Fold;