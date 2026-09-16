'use client'

const WORLD_PRESETS = [
  { freq: 55, filter: 200, gain: 0.08 },
  { freq: 65, filter: 300, gain: 0.06 },
  { freq: 80, filter: 400, gain: 0.07 },
  { freq: 100, filter: 500, gain: 0.06 },
  { freq: 75, filter: 350, gain: 0.05 },
  { freq: 110, filter: 600, gain: 0.08 },
]

class AudioEngine {
  private ctx: AudioContext | null = null
  private oscillator: OscillatorNode | null = null
  private gainNode: GainNode | null = null
  private filterNode: BiquadFilterNode | null = null
  private isPlaying = false

  init() {
    if (this.ctx) return
    this.ctx = new AudioContext()
    this.oscillator = this.ctx.createOscillator()
    this.gainNode = this.ctx.createGain()
    this.filterNode = this.ctx.createBiquadFilter()

    this.oscillator.type = 'sine'
    this.oscillator.frequency.value = WORLD_PRESETS[0].freq
    this.filterNode.type = 'lowpass'
    this.filterNode.frequency.value = WORLD_PRESETS[0].filter
    this.gainNode.gain.value = 0

    this.oscillator.connect(this.filterNode)
    this.filterNode.connect(this.gainNode)
    this.gainNode.connect(this.ctx.destination)
    this.oscillator.start()
  }

  play() {
    if (!this.ctx) this.init()
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    this.isPlaying = true
    this.gainNode?.gain.linearRampToValueAtTime(
      WORLD_PRESETS[0].gain,
      (this.ctx?.currentTime ?? 0) + 0.5
    )
  }

  stop() {
    this.isPlaying = false
    this.gainNode?.gain.linearRampToValueAtTime(0, (this.ctx?.currentTime ?? 0) + 0.5)
  }

  setWorld(worldIndex: number) {
    if (!this.isPlaying || !this.ctx) return
    const preset = WORLD_PRESETS[worldIndex] ?? WORLD_PRESETS[0]
    const t = this.ctx.currentTime + 1
    this.oscillator?.frequency.linearRampToValueAtTime(preset.freq, t)
    this.filterNode?.frequency.linearRampToValueAtTime(preset.filter, t)
    this.gainNode?.gain.linearRampToValueAtTime(preset.gain, t)
  }

  dispose() {
    this.stop()
    this.oscillator?.stop()
    this.ctx?.close()
    this.ctx = null
  }
}

export const audioEngine = new AudioEngine()
