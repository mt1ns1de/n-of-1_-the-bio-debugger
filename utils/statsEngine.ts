import { DataPoint, AnalysisResult } from '../types';

// Helper: Calculate Mean
const mean = (arr: number[]): number => arr.reduce((a, b) => a + b, 0) / arr.length;

// Helper: Calculate Standard Deviation
const stdDev = (arr: number[]): number => {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - m, 2), 0) / (arr.length - 1));
};

// Z-Score Outlier Removal
export const removeOutliers = (data: DataPoint[], threshold: number = 3): DataPoint[] => {
  const values = data.map(d => d.value);
  const m = mean(values);
  const s = stdDev(values);

  return data.map(point => ({
    ...point,
    isOutlier: Math.abs((point.value - m) / s) > threshold
  }));
};

// Mann-Whitney U Test (Normal Approximation for N > 20)
// For smaller N, this is an approximation but sufficient for this demo context.
const mannWhitneyU = (group1: number[], group2: number[]) => {
  const n1 = group1.length;
  const n2 = group2.length;
  
  // Combine and rank
  const combined = [...group1.map(v => ({ v, g: 1 })), ...group2.map(v => ({ v, g: 2 }))];
  combined.sort((a, b) => a.v - b.v);
  
  // Assign ranks (handling ties by averaging ranks)
  const ranks = new Array(combined.length).fill(0);
  let i = 0;
  while (i < combined.length) {
    let j = i;
    while (j < combined.length && combined[j].v === combined[i].v) j++;
    const rank = (i + j + 1) / 2; // Average rank (1-based)
    for (let k = i; k < j; k++) ranks[k] = rank;
    i = j;
  }

  // Sum ranks for group 1
  let r1 = 0;
  for (let k = 0; k < combined.length; k++) {
    if (combined[k].g === 1) r1 += ranks[k];
  }

  const u1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - r1;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);

  // Normal approximation
  const muU = (n1 * n2) / 2;
  const sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = (u - muU) / sigmaU;

  // Two-tailed P-value from Z
  // Approx erf implementation for normal cdf
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  
  return { u, pValue };
};

const normalCdf = (z: number): number => {
  // Constants for approximation
  const p = 0.2316419;
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const t = 1 / (1 + p * Math.abs(z));
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;
  const t5 = t4 * t;
  const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - phi * (b1 * t + b2 * t2 + b3 * t3 + b4 * t4 + b5 * t5);
  return z >= 0 ? cdf : 1 - cdf;
};

// Cohen's d (Effect Size)
const calculateCohensD = (m1: number, m2: number, s1: number, s2: number, n1: number, n2: number) => {
  const pooledStd = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
  return (m2 - m1) / pooledStd;
};

export const analyzeIntervention = (
  data: DataPoint[],
  interventionDate: string
): AnalysisResult => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter outliers for analysis (but keep them in visual if needed, handled by isOutlier flag upstream usually)
  const cleanData = sortedData.filter(d => !d.isOutlier);

  const splitTime = new Date(interventionDate).getTime();
  const pre = cleanData.filter(d => new Date(d.date).getTime() < splitTime).map(d => d.value);
  const post = cleanData.filter(d => new Date(d.date).getTime() >= splitTime).map(d => d.value);

  if (pre.length < 5 || post.length < 5) {
    throw new Error("Insufficient data points (Need N>5 for both Pre and Post).");
  }

  const preMean = mean(pre);
  const postMean = mean(post);
  const preStd = stdDev(pre);
  const postStd = stdDev(post);

  const { u, pValue } = mannWhitneyU(pre, post);
  const cohensD = calculateCohensD(preMean, postMean, preStd, postStd, pre.length, post.length);

  // Verdict logic (George's logic)
  // Strict P < 0.05
  const verdict = pValue < 0.05 ? 'SIGNAL' : 'NOISE';

  return {
    preMean,
    postMean,
    preStd,
    postStd,
    pValue,
    cohensD,
    nPre: pre.length,
    nPost: post.length,
    uStatistic: u,
    verdict
  };
};

// Demo Data Generator
export const generateDemoData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60); // 60 days ago

  // Simulate a real effect: HRV increases after day 30
  for (let i = 0; i < 60; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    // Baseline: 50ms +/- 5
    let value = 50 + (Math.random() - 0.5) * 10;
    
    // Intervention effect after day 30: +10ms
    if (i >= 30) {
      value += 10 + (Math.random() - 0.5) * 5;
    }

    // Add random outliers
    if (Math.random() > 0.95) {
      value += (Math.random() > 0.5 ? 40 : -30);
    }

    data.push({
      date: d.toISOString().split('T')[0],
      value: Number(value.toFixed(1))
    });
  }
  return data;
};