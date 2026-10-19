import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Button, Card, Chip, Empty, ErrorText, Field, Loading, Muted, Screen, Tag, Txt } from '@/components/ui';
import { api } from '@/lib/api';
import { wishDelayMonths } from '@/lib/calc';
import { confirm } from '@/lib/confirm';
import { formatMoney, formatMonths, todayISO } from '@/lib/format';
import { useApiMutation, useStats } from '@/lib/queries';
import { colors, space } from '@/theme';

const PRIORITIES = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Low' },
];

export default function Wishlist() {
  const { data, stats, isLoading } = useStats();
  const addWish = useApiMutation(api.addWish);
  const updateWish = useApiMutation(({ id, patch }: { id: string; patch: Parameters<typeof api.updateWish>[1] }) =>
    api.updateWish(id, patch),
  );
  const deleteWish = useApiMutation(api.deleteWish);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState(2);
  const [asset, setAsset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !data || !stats) return <Loading />;
  const pending = data.wishes.filter((w) => w.status === 'pending');
  const bought = data.wishes.filter((w) => w.status === 'bought');

  async function save() {
    setError(null);
    const value = Number(price.replace(/,/g, ''));
    if (!title.trim()) return setError('Enter a name for your wish');
    if (!Number.isFinite(value) || value <= 0) return setError('Enter a price above 0');
    try {
      await addWish.mutateAsync({ title: title.trim(), price: value, priority, note: '', countsTowardGoal: asset });
      setTitle('');
      setPrice('');
      setPriority(2);
      setAsset(false);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save that wish");
    }
  }

  function buy(id: string, name: string, cost: number, isAsset: boolean) {
    const money = formatMoney(cost, stats!.currency);
    confirm(
      `Mark "${name}" as bought?`,
      isAsset
        ? `It's an asset, so ${money} still counts toward your goal.`
        : `You'll need to earn ${money} again, so it's added back to what you still need.`,
      'Mark bought',
      () => updateWish.mutate({ id, patch: { status: 'bought', boughtAt: todayISO() } }),
    );
  }

  return (
    <Screen
      title="Wishlist"
      right={
        <Pressable accessibilityLabel="Add wish" onPress={() => setOpen((o) => !o)}>
          <Ionicons name={open ? 'close' : 'add'} size={22} color={colors.gold} />
        </Pressable>
      }>
      {open ? (
        <Card strong style={{ marginBottom: space.md }}>
          <Field label="Wish" value={title} onChangeText={setTitle} placeholder="Sneakers" />
          <Field label="Price" value={price} onChangeText={setPrice} placeholder="180" keyboardType="decimal-pad" />
          <Muted style={{ marginTop: space.md, marginBottom: 6 }}>Priority</Muted>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {PRIORITIES.map((p) => (
              <Chip key={p.value} label={p.label} selected={priority === p.value} onPress={() => setPriority(p.value)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.md }}>
            <View style={{ flex: 1, paddingRight: space.md }}>
              <Txt size={13}>Counts toward goal</Txt>
              <Muted size={11}>For assets like gold. Buying it won&apos;t delay your goal.</Muted>
            </View>
            <Switch
              value={asset}
              onValueChange={setAsset}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.text}
            />
          </View>
          <ErrorText>{error}</ErrorText>
          <View style={{ marginTop: space.md }}>
            <Button label="Add wish" onPress={save} loading={addWish.isPending} />
          </View>
        </Card>
      ) : null}

      <ErrorText>{updateWish.error?.message ?? deleteWish.error?.message}</ErrorText>

      {pending.length === 0 && !open ? (
        bought.length > 0 ? (
          <Empty title="No pending wishes" body="Tap + to add your next one." />
        ) : (
          <Empty title="Start your wishlist" body="Add shoes, a trip, a car. Each shows how far it pushes your goal." />
        )
      ) : (
        <View style={{ gap: 8 }}>
          {pending.map((w) => {
            const delay = wishDelayMonths(w.price, stats.avg);
            return (
              <Card key={w.id} strong={w.countsTowardGoal}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable
                    accessibilityLabel={`Mark ${w.title} as bought`}
                    onPress={() => buy(w.id, w.title, w.price, w.countsTowardGoal)}
                    style={{ marginRight: 10 }}>
                    <Ionicons name="ellipse-outline" size={20} color={colors.muted} />
                  </Pressable>
                  <Txt style={{ flex: 1 }}>{w.title}</Txt>
                  <Txt weight="medium">{formatMoney(w.price, stats.currency)}</Txt>
                  <Pressable
                    accessibilityLabel={`Delete ${w.title}`}
                    style={{ marginLeft: space.md }}
                    onPress={() => confirm('Delete this wish?', w.title, 'Delete', () => deleteWish.mutate(w.id))}>
                    <Ionicons name="trash-outline" size={18} color={colors.muted} />
                  </Pressable>
                </View>
                <View style={{ marginTop: 6, marginLeft: 30 }}>
                  {w.countsTowardGoal ? (
                    <Tag label="Asset, still counts to goal" kind="asset" />
                  ) : delay !== null ? (
                    <Tag label={`Delays goal by ${formatMonths(delay)}`} kind="delay" />
                  ) : (
                    <Tag label="Save more to see the delay" kind="neutral" />
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      )}

      {bought.length > 0 ? (
        <View style={{ marginTop: space.lg }}>
          <Muted style={{ marginBottom: 6 }}>Bought</Muted>
          <View style={{ gap: 6 }}>
            {bought.map((w) => (
              <Card key={w.id} style={{ opacity: 0.6, paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable
                    accessibilityLabel={`Undo bought ${w.title}`}
                    onPress={() => updateWish.mutate({ id: w.id, patch: { status: 'pending' } })}
                    style={{ marginRight: 10 }}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.gold} />
                  </Pressable>
                  <Txt color={colors.muted} style={{ flex: 1, textDecorationLine: 'line-through' }}>
                    {w.title}
                  </Txt>
                  <Muted size={13}>{formatMoney(w.price, stats.currency)}</Muted>
                </View>
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      <Muted style={{ textAlign: 'center', marginTop: space.xl }}>
        Marking a wish bought adds its price back to what you still need, unless it&apos;s an asset.
      </Muted>
    </Screen>
  );
}
