import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Muted, Screen, Txt } from '@/components/ui';
import { colors, space } from '@/theme';

/** Contact address shown on the public policy pages. */
export const CONTACT_EMAIL = 'srikarvuppala003@gmail.com';

/** Layout for the public text pages (privacy policy, account deletion). Readable without signing in. */
export function DocPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <Screen
      title={title}
      right={
        <Pressable accessibilityRole="link" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <Txt size={13} color={colors.gold}>
            Back
          </Txt>
        </Pressable>
      }>
      <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center' }}>
        {updated ? <Muted>Last updated {updated}</Muted> : null}
        {children}
      </View>
    </Screen>
  );
}

export const H = ({ children }: { children: string }) => (
  <Txt weight="medium" size={16} style={{ marginTop: space.xl, marginBottom: space.xs }}>
    {children}
  </Txt>
);

export const P = ({ children }: { children: ReactNode }) => (
  <Txt size={14} color={colors.muted} style={{ marginTop: space.sm, lineHeight: 21 }}>
    {children}
  </Txt>
);

export const Li = ({ children }: { children: ReactNode }) => (
  <Txt size={14} color={colors.muted} style={{ marginTop: space.xs, lineHeight: 21 }}>
    {'•  '}
    {children}
  </Txt>
);
