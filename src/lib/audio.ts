export function playCompletionBeep(): void {
  try {
    const AudioContextRef = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextRef) return

    const context = new AudioContextRef()

    const toneA = context.createOscillator()
    const gainA = context.createGain()
    toneA.type = 'triangle'
    toneA.frequency.setValueAtTime(830, context.currentTime)
    gainA.gain.setValueAtTime(0.17, context.currentTime)
    gainA.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3)
    toneA.connect(gainA)
    gainA.connect(context.destination)
    toneA.start(context.currentTime)
    toneA.stop(context.currentTime + 0.3)

    const toneB = context.createOscillator()
    const gainB = context.createGain()
    toneB.type = 'sine'
    toneB.frequency.setValueAtTime(622, context.currentTime + 0.12)
    gainB.gain.setValueAtTime(0.15, context.currentTime + 0.12)
    gainB.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.55)
    toneB.connect(gainB)
    gainB.connect(context.destination)
    toneB.start(context.currentTime + 0.12)
    toneB.stop(context.currentTime + 0.55)

    setTimeout(() => {
      void context.close()
    }, 800)
  } catch {
    // Browser may block Web Audio until explicit user gesture.
  }
}
