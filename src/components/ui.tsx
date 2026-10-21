import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, font, radius, space } from '@/theme';

export function Screen({
  children,
  scroll = true,
  title,
  right,
}: {
  children: ReactNode;
  scroll?: boolean;
  title?: string;
  right?: ReactNode;
}) {
  const body = (
    <>
      {title ? (
        <View style={styles.header}>
          <Txt size={20} weight="medium">
            {title}
          </Txt>
          {right}
        </View>
      ) : null}
      {children}
    </>
  );
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        <View style={styles.scroll}>{body}</View>
      )}
    </SafeAreaView>
  );
}

export function Txt({
  children,
  size = 14,
  weight = 'regular',
  color = colors.text,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  size?: number;
  weight?: 'regular' | 'medium';
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontSize: size, color, fontWeight: font[weight] }, style]}>
      {children}
    </Text>
  );
}

export const Muted = (p: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) => (
  <Txt size={p.size ?? 12} color={colors.muted} style={p.style}>
    {p.children}
  </Txt>
);

export function Card({
  children,
  style,
  strong,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        strong && { borderColor: colors.borderStrong },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? { backgroundColor: colors.gold, borderColor: colors.gold } : null,
      ]}>
      <Txt size={12} color={selected ? colors.onGold : colors.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Tag({
  label,
  kind,
}: {
  label: string;
  kind: 'delay' | 'asset' | 'neutral';
}) {
  const map = {
    delay: { bg: colors.delayBg, fg: colors.delayText },
    asset: { bg: colors.assetBg, fg: colors.gold },
    neutral: { bg: colors.card, fg: colors.muted },
  }[kind];
  return (
    <View style={[styles.tag, { backgroundColor: map.bg }]}>
      <Txt size={11} color={map.fg}>
        {label}
      </Txt>
    </View>
  );
}

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
}) {
  const primary = variant === 'primary';
  const fg = primary ? colors.onGold : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        primary && { backgroundColor: colors.gold, borderColor: colors.gold },
        variant === 'ghost' && { borderColor: 'transparent' },
        variant === 'danger' && { borderColor: colors.danger },
        pressed && { opacity: 0.8 },
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={16} color={fg} style={{ marginRight: 6 }} /> : null}
          <Txt size={14} weight="medium" color={fg}>
            {label}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label?: string; error?: string | null }) {
  return (
    <View style={{ marginTop: space.md }}>
      {label ? <Muted style={{ marginBottom: 6 }}>{label}</Muted> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, error ? { borderColor: colors.danger } : null, props.style]}
      />
      {error ? (
        <Txt size={12} color={colors.danger} style={{ marginTop: 4 }}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <Txt size={12} color={colors.danger} style={{ marginTop: space.sm }}>
      {children}
    </Txt>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xl }}>
      <Txt weight="medium">{title}</Txt>
      <Muted style={{ marginTop: 4, textAlign: 'center' }}>{body}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: space.lg, paddingBottom: space.xl * 2 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.card,
    padding: space.md,
  },
  chip: {
    borderColor: colors.borderStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tag: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.control,
    borderColor: colors.borderStrong,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: space.lg,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.control,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});
