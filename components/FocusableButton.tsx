import React, { useCallback, useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
  StyleProp,
} from 'react-native';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';

interface FocusableButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Focusable button component optimized for TV remote navigation.
 * Responds to focus/blur states and provides visual feedback.
 */
export function FocusableButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  style,
  textStyle,
  disabled,
  ...props
}: FocusableButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handlePressIn = useCallback(() => setIsPressed(true), []);
  const handlePressOut = useCallback(() => setIsPressed(false), []);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary': return viewStyles.primary;
      case 'secondary': return viewStyles.secondary;
      case 'outline': return viewStyles.outline;
      case 'ghost': return viewStyles.ghost;
      default: return viewStyles.primary;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small': return viewStyles.smallSize;
      case 'medium': return viewStyles.mediumSize;
      case 'large': return viewStyles.largeSize;
      default: return viewStyles.mediumSize;
    }
  };

  const getTextVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'primary': return textStyles.primaryText;
      case 'secondary': return textStyles.secondaryText;
      case 'outline': return textStyles.outlineText;
      case 'ghost': return textStyles.ghostText;
      default: return textStyles.primaryText;
    }
  };

  const buttonStyles: StyleProp<ViewStyle> = [
    viewStyles.base,
    getVariantStyle(),
    getSizeStyle(),
    isFocused && viewStyles.focused,
    isPressed && viewStyles.pressed,
    disabled && viewStyles.disabled,
    style,
  ];

  const labelStyles: StyleProp<TextStyle> = [
    typography.button,
    getTextVariantStyle(),
    size === 'small' && typography.buttonSmall,
    disabled && textStyles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={buttonStyles}
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={title}
      {...props}
    >
      {icon}
      <Text style={labelStyles}>{title}</Text>
    </Pressable>
  );
}

const viewStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: spacing.sm,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.secondaryBackground,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  smallSize: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 15,
  },
  mediumSize: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
  },
  largeSize: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
  },
  
  // States
  focused: {
    borderWidth: 3,
    borderColor: colors.focusHighlight,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.muted,
    opacity: 0.5,
  },
});

const textStyles = StyleSheet.create({
  primaryText: {
    color: colors.primaryText,
  },
  secondaryText: {
    color: colors.primaryText,
  },
  outlineText: {
    color: colors.accent,
  },
  ghostText: {
    color: colors.primaryText,
  },
  disabledText: {
    color: colors.secondaryText,
  },
});

export default FocusableButton;
