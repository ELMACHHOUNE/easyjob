import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, PieChart, AreaChart,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Cell, Bar, Area, Pie
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

import { useAnalyticsOverview, useAnalyticsSources } from '@/api/hooks';
import { Button } from '@/components/ui/button';

const dateRanges = ['Cette semaine', 'Ce mois', 'Ce trimestre'];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
      <p className="font-medium text-foreground text-sm">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

function ChartSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="h-5 w-48 animate-pulse rounded bg-muted mb-4" />
      <div className="h-[300px] animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="h-7 w-16 animate-pulse rounded bg-muted mt-2" />
    </div>
  );
}

const statusColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('Ce mois');
  const { data: overviewData, isLoading: isLoadingOverview, error: errorOverview, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: sourcesData, isLoading: isLoadingSources } = useAnalyticsSources();

  const isLoading = isLoadingOverview || isLoadingSources;
  const error = errorOverview;

  const overview = overviewData?.overview ?? {};
  const appsByStatus = overviewData?.appsByStatus ?? [];
  const appsByWeek = overviewData?.appsByWeek ?? [];
  const offersByWeek = overviewData?.offersByWeek ?? [];

  const sources = sourcesData?.sources ?? [];

  const kpis = [
    { label: "Total offres", value: overview.totalOffers, color: "primary" },
    { label: "Total candidatures", value: overview.totalApplications, color: "secondary" },
    { label: "Taux de réponse", value: overview.responseRate, color: "accent", suffix: "%" },
    { label: "Taux d'ouverture", value: overview.emailOpenRate, color: "primary", suffix: "%" }
  ];

  const statusPieData = appsByStatus.map((s, i) => ({
    name: s.name,
    value: s.value,
    color: statusColors[i % statusColors.length],
  }));

  const evolutionData = appsByWeek.map(w => ({
    mois: `S${w._id}`,
    candidatures: w.count,
  }));

  const offersEvolutionData = offersByWeek.map(w => ({
    mois: `S${w._id}`,
    offres: w.count,
  }));

  const sourceChartData = sources.map(s => ({
    source: s.name || 'Inconnu',
    candidatures: s.count,
    score: s.avgScore,
  }));

  const insights = [];
  if (overview.totalApplications > 0 && overview.responseRate > 50) {
    insights.push({ title: "Taux de réponse", value: `${overview.responseRate}%`, trend: "up", description: "Votre taux de réponse est au-dessus de la moyenne." });
  }
  if (overview.emailOpenRate > 30) {
    insights.push({ title: "Ouvertures email", value: `${overview.emailOpenRate}%`, trend: "up", description: "Vos emails sont bien ouverts par les recruteurs." });
  }
  if (sources.length > 0) {
    insights.push({ title: "Source principale", value: sources[0].name || 'N/A', trend: "up", description: `${sources[0].count} candidatures via cette source.` });
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/10 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-destructive">{error?.message || 'Une erreur est survenue.'}</p>
          <Button onClick={() => refetchOverview()} variant="destructive" className="mt-4 px-4 py-2 text-sm font-semibold">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          {dateRanges.map(range => (
            <Button
              key={range}
              variant={selectedRange === range ? "default" : "ghost"}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                selectedRange === range
                  ? 'bg-primary text-white shadow-[var(--shadow-md)]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-card rounded-xl p-5 border border-border shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {kpi.value != null ? (
                  <>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString('fr-FR') : kpi.value}
                    {kpi.suffix ?? ''}
                  </>
                ) : '—'}
              </p>
            </div>
          ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Performance par source</h2>
              {sourceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="source" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="candidatures" name="Candidatures" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée de source disponible.</p>
              )}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Évolution des candidatures</h2>
              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolutionData}>
                    <defs>
                      <linearGradient id="gradCandidatures" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="candidatures"
                      name="Candidatures"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      fill="url(#gradCandidatures)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée d'évolution disponible.</p>
              )}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Répartition par statut</h2>
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée de statut disponible.</p>
              )}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">Offres par semaine</h2>
              {offersEvolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={offersEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="offres" name="Offres" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">Aucune donnée d'offres disponible.</p>
              )}
            </div>
          </>
        )}
      </motion.div>

      {/* Insights */}
      <motion.div variants={fadeIn}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Insights</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {insights.map((insight, i) => {
              const isUp = insight.trend === 'up';
              const Icon = isUp ? TrendingUp : TrendingDown;
              return (
                <div
                  key={i}
                  className="bg-card rounded-xl p-5 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isUp
                        ? 'bg-accent/10 text-accent'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{insight.title}</p>
                      <p className="text-xl font-bold text-foreground">{insight.value}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun insight disponible.</p>
        )}
      </motion.div>
    </motion.div>
  );
}