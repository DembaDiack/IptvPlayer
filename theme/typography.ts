import { TextStyle } from 'react-native';
import colors from './colors';

/**
 * Centralized typography styles for the IPTV app.
 */
export const typography: Record<string, TextStyle> = {
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryText,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryText,
    letterSpacing: 0.2,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.primaryText,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.secondaryText,
    lineHeight: 20,
  },
  
  // Labels
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    letterSpacing: 0.3,
  },
};

export default typography;
