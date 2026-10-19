import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

/** Seven wheels fit up to $9,999,999, so a million-dollar goal has room. */
const DIGITS = 7;
const MAX_VALUE = 10 ** DIGITS - 1;
const ROWS = Array.from({ length: 40 }, (_, i) => i % 10);

// Reel width bounds, and the horizontal space the symbol, commas, gaps and frame take.
const MIN_REEL_W = 22;
const MAX_REEL_W = 34;
const FIXED_W = 63 + 28;

/** Everything about a reel's size derives from its width, so the display can shrink on narrow phones. */
function metrics(reelW: number) {
  const item = Math.round(reelW * 1.53);
  const window = Math.round(reelW * 2.23);
  return { reelW, item, window, offset: (window - item) / 2, font: Math.round(reelW * 0.94) };
}
type Metrics = ReturnType<typeof metrics>;

/** One slot reel: rolls down to `digit` whenever it changes. */
function Reel({ digit, order, dim, m }: { digit: number; order: number; dim: boolean; m: Metrics }) {
  // Row index being shown. Rows repeat 0–9, so index % 10 is the visible digit.
  const row = useSharedValue(0);

  useEffect(() => {
    const current = row.value;
    const base = Math.floor(current / 10) * 10;
    let target = base + 10 + digit;
    if (target <= current) target += 10;
    row.value = withDelay(
      order * 90,
      withTiming(target, { duration: 1100 + order * 160, easing: Easing.out(Easing.cubic) }, (finished) => {
        // Rows repeat, so jump back a lap invisibly to keep the strip short.
        if (finished && row.value >= 20) row.value = row.value - 10;
      }),
    );
  }, [digit, order, row]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: m.offset - row.value * m.item }],
  }));

  return (
    <View style={[styles.window, { width: m.reelW, height: m.window }]}>
      <Animated.View style={style}>
        {ROWS.map((d, i) => (
          <View key={i} style={[styles.item, { height: m.item }]}>
            <Text style={[styles.digit, { fontSize: m.font }, dim && styles.dim]}>{d}</Text>
          </View>
        ))}
      </Animated.View>
      <View pointerEvents="none" style={[styles.shade, { top: 0, height: m.offset }]} />
      <View pointerEvents="none" style={[styles.shade, { bottom: 0, height: m.offset }]} />
    </View>
  );
}

/** Slot-machine display of a whole-number money value, e.g. $0,031,450. Leading zero reels are dimmed. */
export function Reels({ value, symbol }: { value: number; symbol: string }) {
  const [width, setWidth] = useState(0);
  const whole = Math.max(0, Math.round(value));
  const padded = String(Math.min(whole, MAX_VALUE)).padStart(DIGITS, '0');
  const leadingZeros = padded.length - String(Math.min(whole, MAX_VALUE)).length;
  const m = metrics(
    width === 0 ? 30 : Math.max(MIN_REEL_W, Math.min(MAX_REEL_W, Math.floor((width - FIXED_W) / DIGITS))),
  );

  return (
    <View
      style={styles.frame}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`${symbol}${whole.toLocaleString('en-US')} still needed`}>
      <View style={styles.row}>
        <Text style={styles.symbol}>{symbol}</Text>
        {padded.split('').map((c, i) => {
          // A comma sits before each group of three digits counted from the right.
          const comma = i > 0 && (DIGITS - i) % 3 === 0;
          return (
            <View key={i} style={styles.group}>
              {comma ? <Text style={styles.comma}>,</Text> : null}
              {/* Left reels settle first and the last digit settles last, like a real machine. */}
              <Reel digit={Number(c)} order={i} dim={i < leadingZeros} m={m} />
            </View>
          );
        })}
      </View>
      <View style={[styles.pointer, styles.left]} />
      <View style={[styles.pointer, styles.right]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.reel,
    borderColor: colors.gold,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'stretch',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  group: { flexDirection: 'row', alignItems: 'flex-end', marginLeft: 3 },
  symbol: { color: colors.gold, fontSize: 24, fontWeight: '500', marginRight: 0 },
  comma: { color: colors.gold, fontSize: 22, marginRight: 3, marginBottom: 12 },
  window: {
    backgroundColor: colors.bg,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  item: { alignItems: 'center', justifyContent: 'center' },
  digit: { color: colors.text, fontWeight: '500', fontVariant: ['tabular-nums'] },
  dim: { opacity: 0.25 },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11,10,7,0.75)',
  },
  pointer: {
    position: 'absolute',
    top: '50%',
    marginTop: -7,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  left: { left: -2, borderLeftWidth: 9, borderLeftColor: colors.gold },
  right: { right: -2, borderRightWidth: 9, borderRightColor: colors.gold },
});
