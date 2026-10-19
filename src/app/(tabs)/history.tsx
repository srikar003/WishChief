import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { Card, Empty, ErrorText, Loading, Muted, Screen, Txt } from '@/components/ui';
import { api } from '@/lib/api';
import { monthKey, sum } from '@/lib/calc';
import { confirm } from '@/lib/confirm';
import { formatMoney, monthLabel } from '@/lib/format';
import { useApiMutation, useStats } from '@/lib/queries';
import { colors, space } from '@/theme';

export default function History() {
  const { data, stats, isLoading, error } = useStats();
  const remove = useApiMutation(api.deleteEntry);

  const groups = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, typeof data.entries>();
    for (const e of data.entries) {
      const k = monthKey(e.date);
      map.set(k, [...(map.get(k) ?? []), e]);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data]);

  if (isLoading || !data || !stats) return <Loading />;
  const names = new Map(data.categories.map((c) => [c.id, c.name]));

  return (
    <Screen title="History">
      <ErrorText>{error?.message ?? remove.error?.message}</ErrorText>
      {groups.length === 0 ? (
        <Empty title="No savings yet" body="Add your first saving and it will show up here." />
      ) : (
        groups.map(([key, items]) => (
          <View key={key} style={{ marginBottom: space.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Muted>{monthLabel(key)}</Muted>
              <Muted>{formatMoney(sum(items.map((i) => i.amount)), stats.currency)}</Muted>
            </View>
            <View style={{ gap: 6 }}>
              {items.map((e) => (
                <Card key={e.id} style={{ paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Txt size={13}>{e.description || names.get(e.categoryId) || 'Saving'}</Txt>
                      <Muted size={11}>
                        {names.get(e.categoryId) ?? 'Category'} · {e.date}
                      </Muted>
                    </View>
                    <Txt size={14} weight="medium">
                      {formatMoney(e.amount, stats.currency)}
                    </Txt>
                    <Pressable
                      accessibilityLabel="Delete entry"
                      style={{ marginLeft: space.md }}
                      onPress={() =>
                        confirm('Delete this entry?', 'This adds the amount back to what you still need.', 'Delete', () =>
                          remove.mutate(e.id),
                        )
                      }>
                      <Ionicons name="trash-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
