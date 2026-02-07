export interface DataPoint {
  date: string;
  value: number;
  isOutlier?: boolean;
}

export interface AnalysisResult {
  preMean: number;
  postMean: number;
  preStd: number;
  postStd: number;
  pValue: number;
  cohensD: number;
  nPre: number;
  nPost: number;
  uStatistic: number;
  verdict: 'SIGNAL' | 'NOISE';
}

export interface Dataset {
  name: string;
  metric: string;
  data: DataPoint[];
}

export enum ViewState {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS'
}