/**
 * Web Audio API synthesizer for instant alert chimes
 */
export function playAlertChime(urgency: 'high' | 'normal' = 'normal') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (urgency === 'high') {
      // Urgent chime (High impact breaking news)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.28); // E6
    } else {
      // Soft modern chime
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.1); // G5
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6
    }

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);

    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Ignore audio context errors if user hasn't interacted with page yet
  }
}

/**
 * Trigger HTML5 browser desktop notification if permitted
 */
export async function sendDesktopNotification(title: string, body: string, url?: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const notif = new Notification(title, {
      body,
      icon: '/favicon.ico',
    });
    if (url) {
      notif.onclick = () => {
        window.focus();
        window.open(url, '_blank');
      };
    }
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification(title, { body });
    }
  }
}
