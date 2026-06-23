import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line as SvgLine } from 'react-native-svg';

import { safwah } from '../../theme/safwah';

export type LinePoint = { x: string; y: number; label?: string };

type Config = {
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  showArea?: boolean;
};

export function LineChart({ data, config = {} }: { data: LinePoint[]; config?: Config }) {
  const { height = 200, color = safwah.colors.lime, showGrid = true, showLabels = true, showArea = true } = config;
  const [w, setW] = useState(0);

  const padX = 6;
  const padTop = 10;
  const labelH = showLabels ? 22 : 8;
  const chartH = height - labelH - padTop;

  const ys = data.map((d) => d.y);
  const max = Math.max(...ys, 1);
  const min = Math.min(...ys, 0);
  const span = max - min || 1;

  const innerW = Math.max(0, w - padX * 2);
  const px = (i: number) => padX + (data.length <= 1 ? innerW / 2 : (innerW * i) / (data.length - 1));
  const py = (v: number) => padTop + chartH - ((v - min) / span) * chartH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.y)}`).join(' ');
  const area = w > 0 ? `${line} L ${px(data.length - 1)} ${padTop + chartH} L ${px(0)} ${padTop + chartH} Z` : '';
  const grid = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={height}>
          <Defs>
            <LinearGradient id="lcArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.22} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {showGrid &&
            grid.map((g, i) => (
              <SvgLine
                key={i}
                x1={padX}
                x2={w - padX}
                y1={padTop + chartH * g}
                y2={padTop + chartH * g}
                stroke={safwah.colors.hairline}
                strokeWidth={1}
              />
            ))}

          {showArea && <Path d={area} fill="url(#lcArea)" />}
          <Path d={line} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />

          {data.map((d, i) => (
            <Circle
              key={i}
              cx={px(i)}
              cy={py(d.y)}
              r={i === data.length - 1 ? 4.5 : 2.5}
              fill={i === data.length - 1 ? color : safwah.colors.card}
              stroke={color}
              strokeWidth={i === data.length - 1 ? 0 : 1.5}
            />
          ))}
        </Svg>
      )}

      {showLabels && w > 0 && (
        <View style={styles.labels}>
          {data.map((d, i) => (
            <Text key={i} style={styles.label}>
              {d.x}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2, paddingHorizontal: 2 },
  label: { fontFamily: safwah.font.mono, fontSize: 10.5, color: safwah.colors.textMute },
});
