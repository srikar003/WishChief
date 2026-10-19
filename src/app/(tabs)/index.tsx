import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Reels } from '@/components/reels';
import { Button, Card, Chip, Empty, ErrorText, Loading, Muted, Screen, Tag, Txt } from '@/components/ui';
import { authClient } from '@/lib/auth-client';
import { wishDelayMonths } from '@/lib/calc';
import { currencySymbol, formatMoney, formatMonthYear, formatMonths } from '@/lib/format';
import { useStats } from '@/lib/queries';
import { colors, space } from '@/theme';

export default function Home() {
  const { data, stats, isLoading, error } = useStats();
  const { data: session } = authClient.useSession();

  if (isLoading || !data || !stats) {
    return error ? (
      <Screen title="Home">
        <ErrorText>{error.message}</ErrorText>
      </Screen>
    ) : (
      <Loading />
    );
  }

  const first = session?.user.name?.split(' ')[0] ?? '';
  const topWishes = data.wishes.filter((w) => w.status === 'pending').slice(0, 5);
  const reached = stats.hasGoal && stats.remaining === 0;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Muted size={13}>{first ? `Hey ${first}` : 'Welcome'}</Muted>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          {stats.streak > 0 ? (
            <Tag label={`${stats.streak}-month streak`} kind="asset" />
          ) : null}
          <Pressable accessibilityLabel="Settings" onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <Muted size={11} style={{ textAlign: 'center', marginTop: space.lg, marginBottom: space.sm }}>
        {reached ? 'Goal reached' : 'Still needed'}
      </Muted>
      <Reels value={stats.hasGoal ? stats.remaining : 0} symbol={currencySymbol(stats.currency)} />

      {stats.hasGoal ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.sm, flexWrap: 'wrap' }}>
          <Chip label={`${Math.round(stats.progress * 100)}% there`} />
          {!reached ? (
            <Chip
              label={stats.eta ? `Done by ${formatMonthYear(stats.eta)}` : 'Add savings to see a finish date'}
            />
          ) : null}
        </View>
      ) : (
        <Card style={{ marginTop: space.md }}>
          <Txt weight="medium">Set your goal</Txt>
          <Muted style={{ marginTop: 4, marginBottom: space.md }}>
            Choose how much you want to save and the reels will count down what&apos;s left.
          </Muted>
          <Button label="Set goal" onPress={() => router.push('/settings')} />
        </Card>
      )}

      <View style={{ marginTop: space.md }}>
        <Button label="Add saving" icon="add" onPress={() => router.navigate('/add')} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: space.lg,
          marginBottom: space.sm,
        }}>
        <Txt weight="medium">Top wishes</Txt>
        <Link href="/wishlist">
          <Txt size={12} color={colors.gold}>
            See all
          </Txt>
        </Link>
      </View>

      {topWishes.length === 0 ? (
        <Empty title="No wishes yet" body="Add things you want to buy and see how they move your finish date." />
      ) : (
        <View style={{ gap: 6 }}>
          {topWishes.map((w) => {
            const delay = wishDelayMonths(w.price, stats.avg);
            return (
              <Card key={w.id} style={{ paddingVertical: 10 }} strong={w.countsTowardGoal}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="ellipse-outline" size={14} color={colors.muted} style={{ marginRight: 8 }} />
                    <Txt size={13} numberOfLines={1} style={{ flex: 1 }}>
                      {w.title}
                    </Txt>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Txt size={13}>{formatMoney(w.price, stats.currency)}</Txt>
                    {w.countsTowardGoal ? (
                      <Txt size={11} color={colors.gold}>
                        asset
                      </Txt>
                    ) : delay !== null ? (
                      <Txt size={11} color={colors.delayText}>
                        +{formatMonths(delay)}
                      </Txt>
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
