import type { ComponentProps } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimertPressable = Animated.createAnimatedComponent(Pressable);

// Stilen kan også være en animert stil fra Reanimated.
type Props = Omit<PressableProps, 'style'> & {
  style?: ComponentProps<typeof AnimertPressable>['style'];
};

// Knapper og kort krymper litt når de trykkes, så man ser at trykket ble registrert.
export function Trykkbar({ style, onPressIn, onPressOut, accessibilityRole = 'button', ...rest }: Props) {
  const skala = useSharedValue(1);
  const animertStil = useAnimatedStyle(() => ({ transform: [{ scale: skala.get() }] }));

  return (
    <AnimertPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      onPressIn={(e) => {
        skala.set(withTiming(0.97, { duration: 120 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        skala.set(withTiming(1, { duration: 180 }));
        onPressOut?.(e);
      }}
      style={[style, animertStil]}
    />
  );
}
