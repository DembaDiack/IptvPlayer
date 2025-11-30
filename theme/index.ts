export { colors, default as Colors } from './colors';
export { spacing, default as Spacing } from './spacing';
export { typography, default as Typography } from './typography';

// Re-export theme object for convenience
export const theme = {
  colors: require('./colors').default,
  spacing: require('./spacing').default,
  typography: require('./typography').default,
};

export default theme;
