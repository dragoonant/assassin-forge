# Art direction: MGSD

All art uses the **master grade SD** look from mallet-42k (`art/unit-concepts/PROMPTS.md` in that repo):
Gundam SD model-kit proportions, super deformed but **not chibi**.

| | |
|---|---|
| Proportions | About 3 heads tall. Oversized head (about a third of the height), short compact torso, short sturdy legs, oversized hands and weapons |
| Finish | Crisp hard-surface model-kit detail: panel lines, sculpted fabric folds, painted like a premium collectible figure |
| Framing | Full body, front three-quarter view, on a plain round black base |
| Background | Plain white, even soft studio lighting, no shadows, no text |
| World | Renaissance Italy, 1520s, in the visual world of Assassin's Creed |

The figure-on-a-base look fits the game's fiction: every card is a "memory", a little collectible of a person or place.

## Palette by side

| Side | Look |
|---|---|
| Assassins | White and red hooded robes, beaked hood, leather bracers, red sash |
| Templars | Grey cloaks over dark clothes, a small red cross at the collar |
| Landsknechte | Garish slashed-and-puffed striped doublets, huge feathered berets, breastplates |
| Black Bands | Black-lacquered half plate, black sash of mourning |
| Papal and Florentine | Red and gold liveries, crossed keys; Medici blue and gold with the six balls |

## Asset kinds

| Kind | Style key | Size | Used for |
|---|---|---|---|
| Agents | `figure` | 4:3, 1 MP → 640 px WebP | Card art; the speaker's card art doubles as their story portrait |
| Sites | `site` | 4:3 | A miniature building kit on a round base |
| Actions | `action` | 4:3 | An SD figure caught mid-action |
| Story backdrops | `scene` | 16:9 → 1600 px WebP | Behind the briefing and victory scenes, one per battle |

Every prompt is in [`art/subjects.mjs`](../art/subjects.mjs): 64 cards and 16 backdrops.

## Proofs first

The proof set (`PROOFS` in `art/subjects.mjs`) is 9 subjects × 2 images. It answers three questions before we
generate the rest:

1. **Figure on white** (house style) **or on a diorama base?** Compare the three `isotta-ferro` proofs.
2. **FLUX.2 klein or FLUX.1 dev?** klein is faster and can edit images, so variants stay consistent. dev
   may follow long prompts better.
3. Do sites, actions and backdrops read clearly in MGSD style? (`aldine-press`, `hidden-blade`, `ink-and-ash`)

## Workflow (on the studio PC)

1. Start Flux Studio from `local-ai-studio`: `flux-studio\start.bat` (http://localhost:7880).
2. In this repo: `node scripts/art/generate.mjs proofs`
3. Open `art/out/proofs/index.html` and pick favourites.
4. After the proofs are approved: `node scripts/art/generate.mjs cards`, then `node scripts/art/generate.mjs scenes`.
   Add `--only id,id` to redo single subjects, `--model dev` to switch models, `--force` to regenerate.
5. Install your picks: `python scripts/art/install.py --picks art/picks.json`. That file maps each
   destination to its source image, e.g. `{"cards/isotta-ferro": "art/out/cards/isotta-ferro/2.png"}`.
   The installer writes small WebPs to `src/assets/art/`, and the game picks them up automatically.

Raw outputs in `art/out/` are not committed; only the installed WebPs are.

## Licences

FLUX.2 klein and FLUX.1 schnell are Apache-2.0. FLUX.1 dev is non-commercial, which is fine for this private
project.
