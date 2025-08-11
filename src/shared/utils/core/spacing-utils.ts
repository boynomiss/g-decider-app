/**
 * Spacing Utilities
 * 
 * Common spacing patterns for containers and components
 */

import { SPACING } from '../../constants/constants';

/**
 * Standard container spacing - applies consistent margins and padding
 */
export const containerSpacing = {
  marginHorizontal: SPACING.CONTAINER_MARGIN,
  marginBottom: SPACING.SECTION_SPACING,
  paddingHorizontal: SPACING.CONTAINER_PADDING,
  paddingVertical: SPACING.CONTAINER_PADDING_VERTICAL,
};

/**
 * Header container spacing - for header components
 */
export const headerSpacing = {
  marginHorizontal: SPACING.CONTAINER_MARGIN,
  marginTop: SPACING.SMALL,
  marginBottom: SPACING.SECTION_SPACING,
};

/**
 * Card container spacing - for card-like components
 */
export const cardSpacing = {
  marginHorizontal: SPACING.CONTAINER_MARGIN,
  marginBottom: SPACING.SECTION_SPACING,
  paddingHorizontal: SPACING.CONTAINER_PADDING,
  paddingVertical: SPACING.CONTAINER_PADDING_VERTICAL,
};

/**
 * Section spacing - for major sections
 */
export const sectionSpacing = {
  marginBottom: SPACING.SECTION_SPACING,
};
