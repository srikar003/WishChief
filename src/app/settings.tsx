import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, ErrorText, Field, Loading, Muted, Screen, Txt } from '@/components/ui';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';
import { confirm } from '@/lib/confirm';
import { CURRENCIES } from '@/lib/format';
import { useApiMutation, useAppData } from '@/lib/queries';
import type { GoalData } from '@/lib/api';
import { colors, space } from '@/theme';

export default function Settings() {
  const { data } = useAppData();
  if (!data) return <Loading />;
  return <SettingsBody goal={data.goal} />;
}

function SettingsBody({ goal: current }: { goal: GoalData | null }) {
  const qc = useQueryClient();
  const { data: session } = authClient.useSession();
  const saveGoal = useApiMutation(api.saveGoal);

  const [amount, setAmount] = useState(current ? String(current.amount) : '');
  const [target, setTarget] = useState(current?.monthlyTarget ? String(current.monthlyTarget) : '');
  const [currency, setCurrency] = useState(current?.currency ?? 'USD');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);
    const goal = Number(amount.replace(/,/g, ''));
    const monthly = target.trim() ? Number(target.replace(/,/g, '')) : 0;
    if (!Number.isFinite(goal) || goal <= 0) return setError('Enter a goal above 0');
    if (!Number.isFinite(monthly) || monthly < 0) return setError('Enter a monthly target of 0 or more');
    try {
      await saveGoal.mutateAsync({ amount: goal, monthlyTarget: monthly, currency });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your goal");
    }
  }

  async function signOut() {
    await authClient.signOut();
    qc.clear();
  }

  // Email sign-ups confirm with their password; Google sign-ins have none and use their fresh session.
  const accounts = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await authClient.listAccounts()).data ?? [],
  });
  const hasPassword = !!accounts.data?.some((a) => a.providerId === 'credential');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleteError(null);
    if (hasPassword && !deletePassword) return setDeleteError('Enter your password to confirm');
    setDeleting(true);
    try {
      const { error } = await authClient.deleteUser(hasPassword ? { password: deletePassword } : {});
      if (error) {
        setDeleteError(
          hasPassword
            ? (error.message ?? "Couldn't delete your account")
            : 'For security, sign out, sign in again, then retry within a day.',
        );
        return;
      }
      await authClient.signOut().catch(() => {});
      qc.clear();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Couldn't delete your account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen
      title="Settings"
      right={
        <Pressable accessibilityLabel="Close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Ionicons name="close" size={22} color={colors.muted} />
        </Pressable>
      }>
      <Card>
        <Txt weight="medium">Goal</Txt>
        <Muted style={{ marginTop: 2 }}>Only you see this. The home screen counts down what&apos;s left.</Muted>
        <Field label="Goal amount" value={amount} onChangeText={setAmount} placeholder="50000" keyboardType="decimal-pad" />
        <Field
          label="Monthly target (optional)"
          value={target}
          onChangeText={setTarget}
          placeholder="1200"
          keyboardType="decimal-pad"
        />
        <Muted style={{ marginTop: space.md, marginBottom: 6 }}>Currency</Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CURRENCIES.map((c) => (
            <Chip key={c.code} label={`${c.symbol} ${c.code}`} selected={currency === c.code} onPress={() => setCurrency(c.code)} />
          ))}
        </View>
        <ErrorText>{error}</ErrorText>
        {saved ? (
          <Txt size={12} color={colors.gold} style={{ marginTop: space.sm }}>
            Goal saved
          </Txt>
        ) : null}
        <View style={{ marginTop: space.md }}>
          <Button label="Save goal" onPress={save} loading={saveGoal.isPending} />
        </View>
      </Card>

      <Card style={{ marginTop: space.md }}>
        <Txt weight="medium">Account</Txt>
        <Muted style={{ marginTop: 2, marginBottom: space.md }}>{session?.user.email}</Muted>
        <Button label="Sign out" variant="outline" onPress={signOut} />
        <View style={{ marginTop: space.sm }}>
          <Button label="Privacy policy" variant="ghost" onPress={() => router.push('/privacy')} />
        </View>
      </Card>

      <Card style={{ marginTop: space.md }}>
        <Txt weight="medium">Delete account</Txt>
        <Muted style={{ marginTop: 2 }}>
          Permanently deletes your account, savings and wishes. This can&apos;t be undone.
        </Muted>
        {hasPassword ? (
          <Field
            label="Password"
            value={deletePassword}
            onChangeText={setDeletePassword}
            placeholder="Confirm with your password"
            secureTextEntry
            autoCapitalize="none"
          />
        ) : null}
        <ErrorText>{deleteError}</ErrorText>
        <View style={{ marginTop: space.md }}>
          <Button
            label="Delete account"
            variant="danger"
            loading={deleting}
            onPress={() =>
              confirm('Delete your account?', 'Your savings and wishes will be gone for good.', 'Delete', deleteAccount)
            }
          />
        </View>
      </Card>
    </Screen>
  );
}
