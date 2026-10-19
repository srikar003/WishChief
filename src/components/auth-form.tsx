import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { colors, radius, space } from '@/theme';

import { Button, ErrorText, Field, Muted, Screen, Txt } from './ui';

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const signUp = mode === 'sign-up';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (signUp && !name.trim()) return setError('Enter your name');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    if (password.length < 8) return setError('Use at least 8 characters for your password');

    setBusy(true);
    const res = signUp
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    // On success the session updates and the root layout moves us into the app.
    if (res.error) setError(res.error.message ?? 'Something went wrong. Try again.');
  }

  async function google() {
    setError(null);
    const res = await authClient.signIn.social({ provider: 'google', callbackURL: '/' });
    if (res.error) setError(res.error.message ?? "Couldn't sign in with Google");
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: space.xl }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            backgroundColor: colors.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="trophy-outline" size={26} color={colors.onGold} />
        </View>
        <Txt size={22} weight="medium" style={{ marginTop: space.sm }}>
          WishChief
        </Txt>
        <Muted size={13}>Save toward your goal. Earn your wishes.</Muted>
      </View>

      <View style={{ marginTop: space.xl }}>
        {signUp ? (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Srikar" autoCapitalize="words" />
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@company.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          onSubmitEditing={submit}
        />
        <ErrorText>{error}</ErrorText>
        <View style={{ marginTop: space.lg }}>
          <Button label={signUp ? 'Create account' : 'Log in'} onPress={submit} loading={busy} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: space.lg }}>
        <View style={{ flex: 1, height: 0.5, backgroundColor: colors.border }} />
        <Muted size={11}>or</Muted>
        <View style={{ flex: 1, height: 0.5, backgroundColor: colors.border }} />
      </View>

      <Pressable
        onPress={google}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: colors.borderStrong,
          borderWidth: 0.5,
          borderRadius: radius.control,
          paddingVertical: 12,
        }}>
        <Ionicons name="logo-google" size={16} color={colors.text} style={{ marginRight: 8 }} />
        <Txt>Continue with Google</Txt>
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: space.xl }}>
        <Muted size={13}>{signUp ? 'Already have an account? ' : 'New here? '}</Muted>
        <Link href={signUp ? '/' : '/sign-up'}>
          <Txt size={13} color={colors.gold}>
            {signUp ? 'Log in' : 'Create account'}
          </Txt>
        </Link>
      </View>
    </Screen>
  );
}
