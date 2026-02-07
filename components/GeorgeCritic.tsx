import React from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';

interface Props {
  result: AnalysisResult | null;
}

const GeorgeCritic: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const isSignal = result.verdict === 'SIGNAL';
  const isLargeEffect = Math.abs(result.cohensD) > 0.8;

  return (
    <div className={`mt-6 p-6 rounded-lg border-2 ${isSignal ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${isSignal ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
          {isSignal ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
        </div>
        <div>
          <h3 className="text-xl font-bold font-mono mb-2 flex items-center gap-2">
            <BrainCircuit size={20} />
            George's Verdict: {result.verdict}
          </h3>
          <div className="prose prose-invert text-slate-300">
            {isSignal ? (
              <p>
                Finally, something that isn't just random noise. 
                With a P-value of <strong>{result.pValue.toFixed(4)}</strong> and an effect size of <strong>{result.cohensD.toFixed(2)}</strong>, 
                this looks like a legitimate biological shift. {isLargeEffect ? "Actually, that effect size is massive. Did you break the sensor?" : "It's statistically significant, but check your confounding variables."}
              </p>
            ) : (
              <p>
                Stop deluding yourself. P-value is <strong>{result.pValue.toFixed(4)}</strong>. 
                This is indistinguishable from random variance. You likely just slept better one night and decided it was the supplement. 
                <strong>Null hypothesis not rejected.</strong> Go back to the drawing board.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeorgeCritic;