// Audio prompts for Audio Studio (dragoonant/local-ai-studio, audio-studio/, port 7890).
// Music uses ACE-Step 1.5 (style tags, instrumental); sound effects use Stable Audio Open 1.0.
// Installed files are named <kind>/<id>.mp3 and picked up by src/ui/sound.ts.

const SCORE = 'cinematic orchestral video game soundtrack, Renaissance Italy, in the style of the Assassin\'s Creed II score, '
  + 'mysterious and atmospheric, high quality studio recording, instrumental';

/** id → { prompt, seconds, bpm, keyscale } */
export const MUSIC = {
  theme: { prompt: `${SCORE}, main theme, solo female vocalise without words, lute, warm strings, deep frame drums, slow build, haunting and epic`, seconds: 120, bpm: 84, keyscale: 'D minor' },
  story: { prompt: `${SCORE}, quiet underscore for dialogue, soft lute, sustained low strings, distant choir pad, contemplative, sparse`, seconds: 90, bpm: 70, keyscale: 'A minor' },
  venice: { prompt: `${SCORE}, Venice at night, harpsichord ostinato, pizzicato strings, frame drum, tense stealth pulse, intrigue`, seconds: 120, bpm: 100, keyscale: 'E minor' },
  florence: { prompt: `${SCORE}, Florence, lute and recorder melody over driving strings, tambourine, intrigue in the streets, elegant`, seconds: 120, bpm: 108, keyscale: 'G minor' },
  war: { prompt: `${SCORE}, war on the River Po, marching snare and field drums, low brass, pounding taiko, pikes and cannon, relentless`, seconds: 120, bpm: 116, keyscale: 'C minor' },
  rome: { prompt: `${SCORE}, the Sack of Rome, burning city, full choir, heavy percussion, urgent strings, tragic and desperate`, seconds: 120, bpm: 124, keyscale: 'F minor' },
  finale: { prompt: `${SCORE}, final confrontation, Piece of Eden, eerie synth pads blended with choir and orchestra, rising tension, climactic`, seconds: 120, bpm: 128, keyscale: 'B minor' },
  victory: { prompt: `${SCORE}, short triumphant victory fanfare, brass and choir, timpani roll, resolving cadence`, seconds: 14, bpm: 96, keyscale: 'D major' },
  defeat: { prompt: `${SCORE}, short somber defeat sting, low strings and a single bell, fading`, seconds: 12, bpm: 60, keyscale: 'D minor' },
};

/** id → { prompt, seconds, negative } */
export const SFX = {
  recruit: { prompt: 'footsteps on stone and a heavy cloak rustling, a person arriving', seconds: 1.5 },
  send: { prompt: 'quick light footsteps running away on cobblestones', seconds: 1.2 },
  gain: { prompt: 'small crowd in a stone piazza cheering briefly', seconds: 2 },
  clash: { prompt: 'two steel swords clashing hard, sharp metallic ring', seconds: 1.5 },
  eliminate: { prompt: 'body falling on cobblestones with armour clattering', seconds: 1.5 },
  build: { prompt: 'hammering wood and stone, construction', seconds: 2 },
  play: { prompt: 'parchment card flipped onto a wooden table, paper snap', seconds: 1 },
  resolve: { prompt: 'quick dagger unsheathed, metallic swish', seconds: 1 },
  fizzle: { prompt: 'soft puff of air, dull thud, something failing', seconds: 1 },
  bounce: { prompt: 'scandalised crowd gasp and murmur', seconds: 1.5 },
  destroy: { prompt: 'wooden building collapsing with a crash and fire crackle', seconds: 2.5 },
  dusk: { prompt: 'single large church bell tolling once over a city at dusk, long reverb', seconds: 4 },
  control: { prompt: 'short triumphant brass hit with a crowd cheering', seconds: 2.5 },
  'lose-control': { prompt: 'low ominous drum hit and a disappointed crowd groan', seconds: 2.5 },
};
const SFX_NEGATIVE = 'music, melody, singing, speech, low quality, distorted';

/** Proof set: a few cues to approve before generating everything. */
export const PROOFS = [
  { kind: 'music', id: 'theme' },
  { kind: 'music', id: 'venice' },
  { kind: 'sfx', id: 'clash' },
  { kind: 'sfx', id: 'dusk' },
  { kind: 'sfx', id: 'control' },
];

export function requestFor(kind, id) {
  if (kind === 'music') {
    const m = MUSIC[id];
    return { model: 'music', prompt: m.prompt, lyrics: '[Instrumental]', seconds: m.seconds, bpm: m.bpm, keyscale: m.keyscale, timesignature: '4', format: 'mp3' };
  }
  const x = SFX[id];
  return { model: 'sfx', prompt: x.prompt, negative: x.negative ?? SFX_NEGATIVE, seconds: x.seconds, format: 'mp3' };
}
