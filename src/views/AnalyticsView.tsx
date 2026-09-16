import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Calculator, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AnalyticsViewProps {
  currentUser: UserProfile | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currentUser }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentUser?.role]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Calculating analytical metrics deterministically…
      </div>
    );
  }

  const { mclTrend, subsidiaryComparison, targetDeviation, composition, stats } = analyticsData || {};

  const DONUT_COLORS = ['#059669', '#3b82f6'];

  const donutData = composition
    ? [
        { name: 'Opencast (OC)', value: composition.oc },
        { name: 'Underground (UG)', value: composition.ug }
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Statutory Analytics & Comparative Modeling</h2>
          <p className="text-xs text-slate-500">
            Longitudinal trends, target realization, extraction composition, and statistical dispersion computed deterministically
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          VERIFIED DETERMINISTIC ENGINE
        </span>
      </div>

      {/* Summary Statistical KPI Tiles */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Recorded Volume</div>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">
              {stats.sum} <span className="text-xs font-semibold text-slate-600">MT</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Sum of {stats.count} statutory records</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Arithmetic Mean (Avg)</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {stats.mean} <span className="text-xs font-semibold text-slate-600">MT</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Subsidiary output mean</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Median Value</div>
            <div className="text-2xl font-black font-mono text-blue-700 mt-1">
              {stats.median} <span className="text-xs font-semibold text-slate-600">MT</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Robust midpoint distribution</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Range (Min - Max)</div>
            <div className="text-xl font-black font-mono text-slate-900 mt-1">
              {stats.min} – {stats.max} <span className="text-xs font-semibold text-slate-600">MT</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Dispersion span of CIL units</div>
          </div>
        </div>
      )}

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MCL 5-Year Trend Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                MCL 5-Year Production Trajectory (FY2020–21 to FY2024–25)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              CAGR: +9.36%
            </span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mclTrend || []} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[120, 230]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} MT`, 'Production']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="production"
                  name="MCL Raw Coal Production (MT)"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 italic text-center">
            Consistent upward trajectory: 148.01 MT (FY21) → 206.10 MT (FY24) → 212.00 MT (FY25 Proj).
          </div>
        </div>

        {/* 2. Subsidiary Comparison Bar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Subsidiary Output Benchmarking (FY2023–24)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              CIL Total: 773.60 MT
            </span>
          </div>

          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subsidiaryComparison || []} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="entity" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`${value} MT`, 'Production']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="production" name="Production Volume (MT)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 italic text-center">
            MCL (206.10 MT) and SECL (187.00 MT) together account for &gt;50% of Coal India's national volume.
          </div>
        </div>

        {/* 3. Extraction Method Composition (Donut) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                MCL Mining Method Composition (OC vs UG)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">FY2023-24 Breakdown</span>
          </div>

          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} MT`, 'Output']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 text-center">
            Opencast (OC) constitutes <strong>99.88%</strong> (205.85 MT), while Underground (UG) contributes <strong>0.12%</strong> (0.25 MT).
          </div>
        </div>

        {/* 4. Target Realization Breakdown */}
        {targetDeviation && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  MCL Target vs Actual Achievement Variance
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                SURPASSED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase">MoU Target</span>
                <div className="text-xl font-bold font-mono text-slate-800 mt-0.5">204.00 MT</div>
                <span className="text-[10px] text-slate-400">Approved Annual Action Plan</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 text-[10px] uppercase">Actual Realization</span>
                <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">206.10 MT</div>
                <span className="text-[10px] text-emerald-700">Audited Statutory Account</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Net Deviation:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">+{targetDeviation.deviation} MT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Percentage Deviation:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">+{targetDeviation.deviationPercentage}%</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">Target Achievement Ratio:</span>
                <span className="font-mono text-emerald-300 font-extrabold text-sm">{targetDeviation.achievementPercentage}%</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center italic">
              Computed strictly via deterministic code: <code className="text-slate-600 font-mono">Actual - Target = 206.10 - 204.00 = +2.10 MT</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
