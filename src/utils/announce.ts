/**
 * Screen reader announcement utility
 * Announces messages to assistive technologies via a hidden live region
 */

let announcerElement: HTMLElement | null = null;

/**
 * Initialize the announcer element if it doesn't exist
 */
function ensureAnnouncer(): HTMLElement {
  if (!announcerElement) {
    announcerElement = document.getElementById('sr-announcer');

    if (!announcerElement) {
      // Create the announcer element if it doesn't exist
      announcerElement = document.createElement('div');
      announcerElement.id = 'sr-announcer';
      announcerElement.className = 'sr-only';
      announcerElement.setAttribute('aria-live', 'polite');
      announcerElement.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcerElement);
    }
  }
  return announcerElement;
}

/**
 * Announce a message to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' waits for user to finish, 'assertive' interrupts
 */
export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcer = ensureAnnouncer();

  // Set the priority
  announcer.setAttribute('aria-live', priority);

  // Clear and set the message (forces re-announcement)
  announcer.textContent = '';

  // Use requestAnimationFrame to ensure the DOM updates
  requestAnimationFrame(() => {
    announcer.textContent = message;

    // Clear after a delay to prevent stale announcements
    setTimeout(() => {
      if (announcer.textContent === message) {
        announcer.textContent = '';
      }
    }, 1000);
  });
}

/**
 * Announce game start
 */
export function announceGameStart(dishName: string, parTime: number): void {
  announce(`Starting ${dishName}. ${parTime} seconds par time.`);
}

/**
 * Announce time warning
 */
export function announceTimeWarning(seconds: number): void {
  if (seconds === 30) {
    announce('30 seconds remaining.');
  } else if (seconds === 15) {
    announce('15 seconds remaining.', 'assertive');
  } else if (seconds === 10) {
    announce('10 seconds remaining.', 'assertive');
  } else if (seconds === 5) {
    announce('5 seconds remaining.', 'assertive');
  }
}

/**
 * Announce ingredient placement
 */
export function announcePlacement(
  ingredientName: string,
  quality: 'perfect' | 'great' | 'good' | 'acceptable' | 'miss'
): void {
  const qualityText = quality === 'miss' ? 'missed target' : `${quality} placement`;
  announce(`${ingredientName} placed. ${qualityText}.`);
}

/**
 * Announce dish completion
 */
export function announceDishComplete(stars: number, score: number): void {
  const starText = stars === 1 ? '1 star' : `${stars} stars`;
  announce(`Dish complete. ${starText}. Score: ${score}.`, 'assertive');
}

/**
 * Announce navigation
 */
export function announceNavigation(screenName: string): void {
  announce(`Navigated to ${screenName}.`);
}

/**
 * Announce toast message (in case toast isn't visible to screen readers)
 */
export function announceToast(message: string): void {
  announce(message, 'polite');
}
