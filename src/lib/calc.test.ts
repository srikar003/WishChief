import {
  avgMonthly,
  cumulativeSeries,
  Entry,
  etaDate,
  monthsToGoal,
  netSaved,
  remaining,
  streak,
  Wish,
  wishDelayMonths,
} from './calc';

const entry = (amount: number, date: string, id = date + amount): Entry => ({
  id,
  amount,
  categoryId: 'c1',
  description: '',
  date,
});

const wish = (over: Partial<Wish>): Wish => ({
  id: 'w',
  title: 'Thing',
  price: 100,
  priority: 1,
  note: '',
  countsTowardGoal: false,
  status: 'pending',
  boughtAt: null,
  ...over,
});

const NOW = new Date(2026, 9, 18); // 18 Oct 2026

describe('remaining', () => {
  it('subtracts entries from the goal', () => {
    expect(remaining(10000, [entry(1000, '2026-10-01')], [])).toBe(9000);
  });

  it('never goes below zero', () => {
    expect(remaining(500, [entry(1000, '2026-10-01')], [])).toBe(0);
  });

  it('adds a bought consumption wish back to the remaining amount', () => {
    const entries = [entry(1000, '2026-10-01')];
    const shoes = wish({ price: 200, status: 'bought', boughtAt: '2026-10-05' });
    expect(remaining(10000, entries, [shoes])).toBe(9200);
    expect(netSaved(entries, [shoes])).toBe(800);
  });

  it('does not delay the goal for a bought asset wish', () => {
    const entries = [entry(1000, '2026-10-01')];
    const gold = wish({ price: 300, countsTowardGoal: true, status: 'bought', boughtAt: '2026-10-05' });
    expect(remaining(10000, entries, [gold])).toBe(9000);
  });

  it('ignores pending wishes', () => {
    expect(remaining(10000, [entry(1000, '2026-10-01')], [wish({ price: 5000 })])).toBe(9000);
  });
});

describe('avgMonthly and eta', () => {
  it('averages over up to the last 3 months including this one', () => {
    const entries = [
      entry(300, '2026-08-10'),
      entry(600, '2026-09-10'),
      entry(900, '2026-10-10'),
      entry(5000, '2026-01-10'), // too old
    ];
    expect(avgMonthly(entries, [], NOW)).toBe(600);
  });

  it('counts empty months in the window', () => {
    expect(avgMonthly([entry(900, '2026-08-10')], [], NOW)).toBe(300);
  });

  it('uses fewer months when history is short', () => {
    expect(avgMonthly([entry(500, '2026-10-02')], [], NOW)).toBe(500);
  });

  it('subtracts consumption wishes from the month they were bought', () => {
    const shoes = wish({ price: 200, status: 'bought', boughtAt: '2026-10-05' });
    expect(avgMonthly([entry(1000, '2026-10-02')], [shoes], NOW)).toBe(800);
  });

  it('returns null months when there is no positive pace', () => {
    expect(monthsToGoal(1000, 0)).toBeNull();
    expect(monthsToGoal(0, 0)).toBe(0);
    expect(monthsToGoal(1000, 250)).toBe(4);
  });

  it('projects the finish month', () => {
    const d = etaDate(4, NOW);
    expect(d?.getFullYear()).toBe(2027);
    expect(d?.getMonth()).toBe(1);
  });

  it('computes the delay a wish adds', () => {
    expect(wishDelayMonths(600, 300)).toBe(2);
    expect(wishDelayMonths(600, 0)).toBeNull();
  });
});

describe('streak', () => {
  it('counts consecutive months that met the target', () => {
    const entries = [
      entry(500, '2026-07-02'),
      entry(500, '2026-08-02'),
      entry(500, '2026-09-02'),
    ];
    expect(streak(entries, 400, NOW)).toBe(3);
  });

  it('does not break the streak when this month is not yet met', () => {
    const entries = [entry(500, '2026-09-02'), entry(100, '2026-10-02')];
    expect(streak(entries, 400, NOW)).toBe(1);
  });

  it('adds this month once the target is met', () => {
    const entries = [entry(500, '2026-09-02'), entry(450, '2026-10-02')];
    expect(streak(entries, 400, NOW)).toBe(2);
  });

  it('stops at a missed month', () => {
    const entries = [entry(500, '2026-07-02'), entry(100, '2026-08-02'), entry(500, '2026-09-02')];
    expect(streak(entries, 400, NOW)).toBe(1);
  });

  it('is zero without a target', () => {
    expect(streak([entry(500, '2026-09-02')], 0, NOW)).toBe(0);
  });
});

describe('cumulativeSeries', () => {
  it('accumulates net savings month by month through now', () => {
    const series = cumulativeSeries(
      [entry(100, '2026-08-01'), entry(200, '2026-10-01')],
      [],
      NOW,
    );
    expect(series.map((s) => s.value)).toEqual([100, 100, 300]);
    expect(series[0].month).toBe('2026-08');
  });
});
