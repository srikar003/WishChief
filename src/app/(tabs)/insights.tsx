import { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { Card, Empty, Loading, Muted, Screen, Txt } from '@/components/ui';
import { byCategory, cumulativeSeries, monthlySaved, toMonthKey, addMonthsToKey } from '@/lib/calc';
import { formatMoney, shortMonth } from '@/lib/format';
import { useStats } from '@/lib/queries';
import { CHART_COLORS, colors, space } from '@/theme';

export default function Insights() {
  const { data, stats, isLoading } = useStats();
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(width, 600) - space.lg * 2 - space.md * 2 - 40;

  const view = useMemo(() => {
    if (!data || !stats) return null;
    const history = cumulativeSeries(data.entries, data.wishes);

    // Projection: continue at the current monthly pace until the goal is met (max 24 months).
    const projection: number[] = [];
    let labels = history.map((h) => shortMonth(h.month));
    if (history.length > 0 && stats.avg > 0 && stats.months !== null && stats.months > 0) {
      const steps = Math.min(Math.ceil(stats.months), 24);
      const goal = data.goal?.amount ?? Infinity;
      const last = history[history.length - 1];
      for (let i = 1; i <= steps; i++) {
        projection.push(Math.min(last.value + stats.avg * i, goal));
        labels = [...labels, shortMonth(addMonthsToKey(last.month, i))];
      }
    }

    const lineData = [
      ...history.map((h, i) => ({ value: h.value, label: i % 2 === 0 ? labels[i] : '' })),
      ...projection.map((v, i) => ({ value: v, label: (history.length + i) % 2 === 0 ? labels[history.length + i] : '' })),
    ];

    const names = new Map(data.categories.map((c) => [c.id, c.name]));
    const pie = [...byCategory(data.entries).entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, value], i) => ({
        value,
        name: names.get(id) ?? 'Other',
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
    const pieTotal = pie.reduce((a, p) => a + p.value, 0);

    const target = data.goal?.monthlyTarget ?? 0;
    const saved = monthlySaved(data.entries);
    const now = toMonthKey(new Date());
    const bars = Array.from({ length: 6 }, (_, i) => {
      const key = addMonthsToKey(now, i - 5);
      const value = saved.get(key) ?? 0;
      return {
        value,
        label: shortMonth(key),
        frontColor: target > 0 && value < target ? colors.goldDim : colors.gold,
      };
    });

    return { history, lineData, historyLen: history.length, pie, pieTotal, bars, target };
  }, [data, stats]);

  if (isLoading || !data || !stats || !view) return <Loading />;
  if (data.entries.length === 0) {
    return (
      <Screen title="Insights">
        <Empty title="Nothing to chart yet" body="Add a few savings and your charts will appear here." />
      </Screen>
    );
  }

  const barMax = Math.max(view.target, ...view.bars.map((b) => b.value), 1);

  return (
    <Screen title="Insights">
      <Card style={{ overflow: 'hidden' }}>
        <Muted>Savings over time</Muted>
        <View style={{ marginTop: space.md }}>
          <LineChart
            data={view.lineData}
            width={chartWidth}
            height={140}
            color={colors.gold}
            thickness={2}
            hideDataPoints
            lineSegments={
              view.lineData.length > view.historyLen
                ? [
                    {
                      startIndex: view.historyLen - 1,
                      endIndex: view.lineData.length - 1,
                      color: colors.goldDim,
                      strokeDashArray: [4, 3],
                    },
                  ]
                : undefined
            }
            yAxisThickness={0}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
            yAxisLabelWidth={44}
            formatYLabel={(v: string) => {
              const n = Number(v);
              return n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(Math.round(n));
            }}
            initialSpacing={8}
            spacing={Math.max(20, chartWidth / Math.max(view.lineData.length, 6))}
            adjustToWidth
            noOfSections={4}
            backgroundColor="transparent"
          />
        </View>
        {view.lineData.length > view.historyLen ? <Muted size={11}>Dashed line shows your projection.</Muted> : null}
      </Card>

      <Card style={{ marginTop: space.md }}>
        <Muted>By category</Muted>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.md }}>
          <PieChart
            data={view.pie}
            donut
            radius={50}
            innerRadius={30}
            innerCircleColor={colors.card}
            backgroundColor={colors.card}
          />
          <View style={{ flex: 1, gap: 6 }}>
            {view.pie.map((p) => (
              <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: p.color }} />
                <Txt size={12} style={{ flex: 1 }} numberOfLines={1}>
                  {p.name}
                </Txt>
                <Muted size={12}>{Math.round((p.value / view.pieTotal) * 100)}%</Muted>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: space.md, overflow: 'hidden' }}>
        <Muted>Monthly savings{view.target > 0 ? ` vs target ${formatMoney(view.target, stats.currency)}` : ''}</Muted>
        <View style={{ marginTop: space.md }}>
          <BarChart
            data={view.bars}
            width={chartWidth}
            height={120}
            maxValue={barMax * 1.1}
            barWidth={Math.max(18, chartWidth / 10)}
            spacing={Math.max(10, chartWidth / 14)}
            initialSpacing={8}
            roundedTop
            yAxisThickness={0}
            xAxisColor={colors.border}
            rulesColor={colors.border}
            yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
            yAxisLabelWidth={44}
            noOfSections={3}
            showReferenceLine1={view.target > 0}
            referenceLine1Position={view.target}
            referenceLine1Config={{ color: colors.muted, dashWidth: 4, dashGap: 3, thickness: 1 }}
            backgroundColor="transparent"
          />
        </View>
      </Card>
    </Screen>
  );
}
