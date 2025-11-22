/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for user interactions where supported
 */

/**
 * Trigger haptic feedback on supported devices
 * @param type - The type of haptic feedback ('light', 'medium', 'heavy')
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  // Check if the Vibration API is supported
  if (!('vibrate' in navigator)) {
    return;
  }

  // Map feedback types to vibration patterns (in milliseconds)
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 30,
  };

  try {
    navigator.vibrate(patterns[type]);
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Trigger haptic feedback for button press
 */
export function hapticButtonPress(): void {
  triggerHaptic('light');
}

/**
 * Trigger haptic feedback for success action
 */
export function hapticSuccess(): void {
  triggerHaptic('medium');
}

/**
 * Trigger haptic feedback for error or warning
 */
export function hapticError(): void {
  // Double vibration pattern for errors
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([30, 50, 30]);
    } catch (error) {
      console.debug('Haptic feedback not available:', error);
    }
  }
}

/**
 * Trigger haptic feedback for selection change
 */
export function hapticSelection(): void {
  triggerHaptic('light');
}

/**
 * Check if haptic feedback is supported on the current device
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}
