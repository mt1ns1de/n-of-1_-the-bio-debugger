import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Upload, 
  BarChart2, 
  Trash2, 
  Play, 
  Settings,
  Github,
  Database
} from 'lucide-react';
import { DataPoint, AnalysisResult, ViewState } from './types';
import { removeOutliers, analyzeIntervention, generateDemoData } from './utils/statsEngine';
import Visualizer from './components/Visualizer';
import GeorgeCritic from './components/GeorgeCritic';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.UPLOAD);
  const [data, setData] = useState<DataPoint[]>([]);
  const [metricName, setMetricName] = useState<string>("HRV (ms)");
  const [interventionDate, setInterventionDate] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [csvRaw, setCsvRaw] = useState<string>("");

  // Handler for demo data
  const loadDemoData = () => {
    const demo = generateDemoData();
    // Auto set intervention to 30 days into demo
    const midPoint = demo[30].date;
    setData(removeOutliers(demo));
    setInterventionDate(midPoint);
    setMetricName("HRV (ms)");
    setView(ViewState.ANALYSIS);
  };

  // Handler for CSV Upload (Simple parsing for Date,Value format)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvRaw(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      const parsed: DataPoint[] = [];
      
      // Simple heuristic: Skip header, assume col 0 is date, col 1 is value
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length < 2) continue;
        
        const dateStr = parts[0].trim();
        const valStr = parts[1].trim();
        
        const val = parseFloat(valStr);
        if (!isNaN(val) && dateStr) {
           // Ensure date is valid
           const d = new Date(dateStr);
           if (!isNaN(d.getTime())) {
             parsed.push({
               date: d.toISOString().split('T')[0],
               value: val
             });
           }
        }
      }
      
      if (parsed.length === 0) {
        alert("No valid data found. CSV must be: Date,Value");
        return;
      }

      setData(removeOutliers(parsed));
      // Guess middle date as intervention default
      setInterventionDate(parsed[Math.floor(parsed.length / 2)].date);
      setView(ViewState.ANALYSIS);
    } catch (err) {
      console.error(err);
      alert("Error parsing CSV");
    }
  };

  const runAnalysis = () => {
    if (!interventionDate) return;
    try {
      const result = analyzeIntervention(data, interventionDate);
      setAnalysisResult(result);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (view === ViewState.ANALYSIS && data.length > 0 && interventionDate) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interventionDate, data, view]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-500" />
            <span className="font-bold text-lg tracking-tight">N-of-1 <span className="text-slate-500 font-mono text-sm">Bio-Debugger</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
            <span className="flex items-center gap-1"><Database size={14}/> v1.0.0</span>
            <a href="#" className="hover:text-emerald-400 transition-colors"><Github size={18}/></a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {view === ViewState.UPLOAD ? (
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white tracking-tight">Validate Your Biology.</h1>
              <p className="text-slate-400 text-lg">
                Stop guessing. Use robust statistics (Mann-Whitney U) to distinguish 
                biological signal from sensor noise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Card */}
              <div className="group relative p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                    <Upload className="text-emerald-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold">Upload CSV</h3>
                  <p className="text-sm text-slate-500">Format: Date (YYYY-MM-DD), Value</p>
                </div>
              </div>

              {/* Demo Card */}
              <button 
                onClick={loadDemoData}
                className="group p-8 bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col items-center gap-4 text-left"
              >
                <div className="p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                  <Play className="text-blue-500" size={32} />
                </div>
                <h3 className="text-xl font-semibold">Load Demo Data</h3>
                <p className="text-sm text-slate-500">Simulate a Magnesium Supplement intervention</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setData([]);
                    setView(ViewState.UPLOAD);
                    setAnalysisResult(null);
                  }}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <Trash2 size={20} />
                </button>
                <div className="h-6 w-px bg-slate-800"></div>
                <div>
                  <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Intervention Date</label>
                  <input 
                    type="date" 
                    value={interventionDate}
                    onChange={(e) => setInterventionDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white text-sm rounded px-3 py-1 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                    <label className="block text-xs text-slate-500 font-mono uppercase mb-1">Metric Name</label>
                    <input 
                        type="text" 
                        value={metricName}
                        onChange={(e) => setMetricName(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-white text-sm rounded px-3 py-1 w-32 focus:outline-none focus:border-emerald-500"
                    />
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">N={data.length}</span>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Col: Chart */}
              <div className="lg:col-span-2 space-y-8">
                <Visualizer data={data} interventionDate={interventionDate} />
                <GeorgeCritic result={analysisResult} />
              </div>

              {/* Right Col: Stats Panel */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold mb-6">
                    <BarChart2 className="text-emerald-500" size={20} />
                    Statistical Engine
                  </h3>

                  {analysisResult ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 font-mono uppercase">Pre-Mean</p>
                            <p className="text-2xl font-bold">{analysisResult.preMean.toFixed(2)}</p>
                            <p className="text-xs text-slate-600">σ = {analysisResult.preStd.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 font-mono uppercase">Post-Mean</p>
                            <p className="text-2xl font-bold text-blue-400">{analysisResult.postMean.toFixed(2)}</p>
                            <p className="text-xs text-slate-600">σ = {analysisResult.postStd.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400">Mann-Whitney U (P-Value)</p>
                                <p className={`text-3xl font-mono font-bold ${analysisResult.pValue < 0.05 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {analysisResult.pValue.toExponential(3)}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${analysisResult.pValue < 0.05 ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                    {analysisResult.pValue < 0.05 ? 'Significant' : 'Not Significant'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-400">Cohen's d (Effect Size)</p>
                                <p className="text-3xl font-mono font-bold text-blue-400">
                                    {analysisResult.cohensD.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase">
                                    {Math.abs(analysisResult.cohensD) < 0.2 ? 'Negligible' : 
                                     Math.abs(analysisResult.cohensD) < 0.5 ? 'Small' :
                                     Math.abs(analysisResult.cohensD) < 0.8 ? 'Medium' : 'Large'}
                                </p>
                            </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-600">
                        Select an intervention date to run stats.
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold mb-4 text-slate-400 uppercase font-mono">
                        <Settings size={16} /> Data Hygiene
                    </h3>
                    <div className="space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between">
                            <span>Z-Score Threshold</span>
                            <span className="text-white">3.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Outliers Removed</span>
                            <span className="text-red-400">{data.filter(d => d.isOutlier).length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Test Type</span>
                            <span className="text-white">Mann-Whitney U (Non-parametric)</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;