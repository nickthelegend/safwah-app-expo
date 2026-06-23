import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { safwah } from '../../theme/safwah';

export type BarDatum = { label: string; value: number; color?: string };

type Config = { height?: number; showLabels?: boolean; showValues?: boolean };

export function BarChart({ data, config = {} }: { data: BarDatum[]; config?: Config }) {
  const { height = 220, showLabels = true, showValues = true } = config;
  const [w, setW] = useState(0);

  const labelH = showLabels ? 22 : 6;
  const valueH = showValues ? 18 : 6;
  const chartH = height - labelH - valueH;
  const max = Math.max(...data.map((d) => d.value), 1);

  const gap = 14;
  const barW = data.length > 0 ? Math.max(8, (w - gap * (data.length - 1)) / data.length) : 0;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {showValues && w > 0 && (
        <View style={styles.row}>
          {data.map((d, i) => (
            <Text key={i} style={[styles.value, { width: barW }]}>
              {d.value}
            </Text>
          ))}
        </View>
      )}

      {w > 0 && (
        <Svg width={w} height={chartH}>
          {data.map((d, i) => {
            const h = Math.max(2, (d.value / max) * (chartH - 4));
            const x = i * (barW + gap);
            const y = chartH - h;
            return <Rect key={i} x={x} y={y} width={barW} height={h} rx={7} fill={d.color || safwah.colors.lime} opacity={0.92} />;
          })}
        </Svg>
      )}

      {showLabels && w > 0 && (
        <View style={styles.row}>
          {data.map((d, i) => (
            <Text key={i} style={[styles.label, { width: barW }]} numberOfLines={1}>
              {d.label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  value: { fontFamily: safwah.font.monoBold, fontSize: 11, color: safwah.colors.textDim, textAlign: 'center', marginBottom: 6 },
  label: { fontFamily: safwah.font.regular, fontSize: 11, color: safwah.colors.textMute, textAlign: 'center', marginTop: 6 },
});
