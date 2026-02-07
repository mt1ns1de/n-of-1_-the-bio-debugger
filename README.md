# N-of-1: The Bio-Debugger

A causal inference tool for validating biological interventions. 
**No backend. No cloud. 100% client-side statistical analysis.**

![Bio-Debugger Demo](./demo.png)

> "In data we trust, everyone else must bring a p-value."

---

## The Problem

Most self-experimentation in health (supplements, diet, sleep hygiene) is ruined by **Confirmation Bias**. A user takes a pill, sleeps well once, and assumes a causal link. 
**Critique:** Bio-data from wearables (Oura, Apple Health) is extremely noisy. Sensor artifacts and random environmental variance are frequently mistaken for "results."

## The Solution: N-of-1 Causal Inference

I built a tool that treats the human body as a legacy system with noisy logs. It applies a rigorous statistical pipeline to prove or disprove the efficacy of any intervention:

1.  **Sanitization Layer:** Implements Z-Score filtering (threshold 3.0) to strip sensor artifacts before analysis.
2.  **Logic Layer:** Uses the Mann-Whitney U test (non-parametric) to compare distributions rather than simple means.
3.  **Verdict Layer:** Calculates Cohen’s d (Effect Size) to determine if a statistically significant result actually has biological magnitude.

---

## Architecture

We avoid external processing to ensure data privacy and zero latency.

graph TD
    Data((Messy CSV)) --> Sanitizer[Outlier Removal: Z-Score]
    Sanitizer --> Splitter{Split by Date}
    Splitter -- "Pre-Intervention" --> Engine[MW-U Stat Engine]
    Splitter -- "Post-Intervention" --> Engine
    Engine --> Analysis[P-Value + Effect Size]
    Analysis --> UI[Interactive Visualizer]
Design Philosophy (First Principles)
1. Rank over Distribution (Mann-Whitney U)

I chose the Mann-Whitney U test over the standard T-test. Biometric data (like HRV or Sleep Scores) rarely follows a perfect Gaussian distribution. By using a rank-based, non-parametric test, the tool remains robust even when the data is skewed or contains non-linear noise.

2. Data Hygiene as a Default

Biology is "legacy code" with hardware failures (sensors). A single night of 12-hour sleep due to a sensor error can ruin a monthly average. The tool treats any value outside 3 standard deviations as a "bug" and flags it, preventing outliers from poisoning the conclusion.

3. N-of-1 > Population Averages

Traditional clinical trials care about the "average human." This tool cares only about the specific instance (N=1). It allows for personalized debugging where the user is both the control group and the experimental group.

Tech Stack

Logic: Custom TypeScript implementation of Mann-Whitney U and Normal CDF.

Frontend: React 19 (Vite), Tailwind CSS.

Visuals: Recharts for interactive time-series and distribution analysis.

Icons: Lucide-React.

Internal FAQ (Skepticism handled)

Q: Can this tool prove the Magnesium pill caused the sleep improvement?
A: No. Correlation is not causation. However, it can prove that the improvement is statistically real and not a random fluctuation. The user is responsible for controlling confounding variables (e.g., not changing their diet at the same time).

Q: Why not just use a Python notebook?
A: Friction. Most people won't run a script. By building this in React/TS, I’ve removed the barrier between "raw wearable export" and "statistical insight" while keeping the data private in the browser's memory.

Q: What is the significance of the P-value here?
A: If P < 0.05, it means there is less than a 5% chance that the change you see happened by accident. If P is high, the "result" you feel is likely noise.

Run Locally
1. Clone and Setup
code
Bash
download
content_copy
expand_less
git clone https://github.com/mt1ns1de/n-of-1_-the-bio-debugger.git
cd n-of-1_-the-bio-debugger
npm install
2. Run Development Server
code
Bash
download
content_copy
expand_less
npm run dev
License

This project is open source and available under the MIT License.

Author

Built by mt1ns1de.
Systems Engineer focused on removing friction from complex systems.
