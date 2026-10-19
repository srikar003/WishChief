import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from './api';
import * as calc from './calc';

export const DATA_KEY = ['data'] as const;

export function useAppData() {
  return useQuery({ queryKey: DATA_KEY, queryFn: api.data });
}

/** Mutation that refreshes app data afterwards. */
export function useApiMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: DATA_KEY }),
  });
}

/** All derived numbers the screens show, computed from the raw data. */
export function useStats() {
  const { data, ...rest } = useAppData();

  const stats = useMemo(() => {
    if (!data) return null;
    const { goal, entries, wishes } = data;
    const goalAmount = goal?.amount ?? 0;
    const rem = calc.remaining(goalAmount, entries, wishes);
    const avg = calc.avgMonthly(entries, wishes);
    const months = calc.monthsToGoal(rem, avg);
    return {
      goal,
      hasGoal: !!goal,
      currency: goal?.currency ?? 'USD',
      remaining: rem,
      netSaved: calc.netSaved(entries, wishes),
      progress: calc.progress(goalAmount, entries, wishes),
      avg,
      months,
      eta: calc.etaDate(months),
      streak: calc.streak(entries, goal?.monthlyTarget ?? 0),
      thisMonthSaved: calc.monthlySaved(entries).get(calc.toMonthKey(new Date())) ?? 0,
    };
  }, [data]);

  return { data, stats, ...rest };
}
