# DripLine

**A pour-over coach on your glasses — guidance drawn on the coffee bed itself, so your hands stay on the kettle and your eyes stay on the coffee.**

DripLine is a Lens for Spectacles (built and demonstrated in Lens Studio's preview) that guides one complete pour-over brew in a single 2:30 loop. Pinch the dripper once to start; from then on a glowing dot on the coffee bed shows where your water should land, a thin ring around the server shows the phase progress, soft chimes mark the phase changes, and one short line of text on the counter tells you what to do. No floating panels, no numeric countdown, no phone to check with wet hands.

## The brew loop (one cup: 15 g coffee / 250 g water / 2:30 total)

| Phase | Time | What you see | On-screen text |
|---|---|---|---|
| Bloom | 0:00–0:45 | A ring opens on the bed; the dot traces a small circle (~2 cm radius), then rests at the center | `Pour; wet grounds` |
| Pour 1 | 0:45–1:15 | Chime; the dot spirals slowly from the center out to 4.5 cm and back | `Follow dot; spiral` |
| Rest | 1:15–1:30 | The dot rests at the center, the trail clears, no text — a quiet beat | — |
| Pour 2 | 1:30–2:00 | Chime; the same slow spiral again | `Follow dot to 250 g` |
| Drawdown | 2:00–2:30 | Chime; dot and trail disappear, the phase ring fills to completion | `Let it draw down` |
| Done | 2:30 | Done chime; all guidance clears; a short message shows for ~5 s | `Done — enjoy` |

Before the brew, the counter shows `Pinch dripper: start`. Pinches during an active brew are ignored; pinching again after Done restarts from Bloom.

## How to use

1. Open `CoffeeMaker.esproj` in **Lens Studio 5.23.2**.
2. Open the **Interactive Preview** (the scene contains a real-scale virtual pour-over setup on a kitchen counter: cone dripper, glass server, scale, gooseneck kettle).
3. Walk up to the dripper and **pinch it** (in the preview, clicking acts as a pinch). The bloom ring and pour dot appear and the loop starts.
4. Keep both hands on the kettle and follow the dot for 2:30, until `Done — enjoy` appears.

The virtual setup is a stand-in: in the real version, the dripper's rim and the coffee-bed surface would be detected so the spiral can be sized to your dripper. The preview demonstrates the response to that detection; no camera recognition is used or needed here.

## Design notes

- **The 4.5 cm rule.** The coffee bed is 10 cm across (5 cm radius); the pour dot's center never goes beyond **4.5 cm from the center**, so the guide never leads your water onto the paper filter's edge — a real pour-over rule, turned into a design constraint.
- **Guides, doesn't grade.** DripLine never senses the kettle, the water stream, or where your water actually lands, and it never scores your pour. Gram figures in the texts are recipe targets, not measurements.
- **No numbers.** There is no countdown anywhere. The phase ring filling around the server's base is the only within-phase time cue, and phase changes arrive as sound, so you don't have to watch the label.
- **Text lives in the world.** Labels sit on the counter surface in front of the server, angled up toward you — nothing is head-locked and no panel floats in front of your face.
- **One input.** A single pinch starts the brew. Everything after that is timer-driven; there are no buttons, menus, or voice commands.

The full design brief — the spatial moment, placement measurements, done criteria, and what is deliberately out of scope — is in [`devpost/design-brief.md`](devpost/design-brief.md). The build log is in [`devpost/build-log.md`](devpost/build-log.md).

## Built with

- **Lens Studio 5.23.2** (Spectacles / SPECS target), TypeScript
- **Spectacles Interaction Kit (SIK)** and **Spectacles UI Kit** for the pinch interaction
- **plan-lens** — the design brief in `devpost/` was produced with it before any building
- **CLAD** — the Lens was built and verified in the editor by an AI agent driving Lens Studio
- **LEAF** — scenario checks for the design brief's done criteria live in `Assets/Tests/`

## Project structure

```
CoffeeMaker.esproj        Lens Studio project file
Assets/
  Scene.scene             The virtual kitchen-counter pour-over scene
  Scripts/
    DripLineMain.ts       Brew state machine: phases, timing, guide motion
    DripLineLabelUI.ts    Counter-surface labels and tips
    DripLineMesh.ts       Procedural meshes (dripper, server, guides)
    DripLineSceneContracts.ts
  Tests/                  LEAF scenario checks for the done criteria
  GeneratedSFX/           Phase / done chimes
  Materials/, Render/
Packages/                 SIK, Spectacles UI Kit, LEAF, and preview tooling
devpost/
  design-brief.md         The plan-lens design brief (approved)
  build-log.md            How the Lens was built, step by step
```

## License

MIT
