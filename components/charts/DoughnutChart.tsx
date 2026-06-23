import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { safwah } from '../../theme/safwah';

export type DoughnutDatum = { label: string; value: number; color?: string };

const PALETTE = ['#CCFF00', '#10b981', '#38bdf8', '#f59e0b', '#a78bfa', '#fb7185'];

type Config = { height?: number; innerRadius?: number; centerLabel?: string; centerValue?: string };

export function DoughnutChart({ data, config = {} }: { data: DoughnutDatum[]; config?: Config }) {
  const { height = 240, innerRadius = 0.62, centerLabel, centerValue } = config;
  const size = height;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const stroke = r * (1 - innerRadius) * 2;
  const C = 2 * Math.PI * r;

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${cx}, ${cy}`}>
            <Circle cx={cx} cy={cy} r={r} stroke={safwah.colors.cardSoft} strokeWidth={stroke} fill="none" />
            {data.map((d, i) => {
              const frac = d.value / total;
              const dash = frac * C;
              const offset = -acc * C;
              acc += frac;
              return (
                <Circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={r}
                  stroke={d.color || PALETTE[i % PALETTE.length]}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none">
          {centerValue ? <Text style={styles.centerValue}>{centerValue}</Text> : null}
          {centerLabel ? <Text style={styles.centerLabel}>{centerLabel}</Text> : null}
        </View>
      </View>

      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: d.color || PALETTE[i % PALETTE.length] }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {d.label}
            </Text>
            <Text style={styles.legendPct}>{Math.round((d.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerValue: { fontFamily: safwah.font.monoBold, fontSize: 20, color: safwah.colors.text },
  centerLabel: { fontFamily: safwah.font.regular, fontSize: 11, color: safwah.colors.textMute, marginTop: 2 },
  legend: { width: '100%', marginTop: 18, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontFamily: safwah.font.medium, fontSize: 13, color: safwah.colors.textDim },
  legendPct: { fontFamily: safwah.font.monoBold, fontSize: 13, color: safwah.colors.text },
});
