---
status: approved
---

# Design brief: DripLine

<!-- Filled in by plan-lens from the learner's interview. Use the learner's words. Mark any value they didn't choose as (default). -->

## The one spatial moment
I stand at my kitchen counter with a kettle in both hands, looking down at the dripper about 60 cm away; after a single pinch to start, a glowing ring opens on the coffee bed and a bright dot shows where my water should land, tracing a small bloom circle and slow pour spirals. Hands stay on the kettle, eyes stay on the dripper through one 2:30 brew, until the guidance clears, a soft chime plays, and “Done — enjoy” appears briefly.

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free; the real version shares your view to align guidance with the coffee bed.
- Why it's better than the phone or laptop version: the hard part of a hand drip is not the recipe — it is the pour itself: where the water lands, how fast the kettle moves, and when each phase changes. A phone timer sits beside the dripper and makes me look away and read a recipe panel mid-pour, with wet hands. A video recipe cannot pace itself to my brew. The guidance lives on the coffee bed, moves at pouring speed, and gets out of the way; phase changes arrive as sound.

## Product or overlay
- Type: overlay for people learning pour-over coffee at home.
- What the real version would sense: the dripper's rim and the surface of the coffee bed, so the spiral can be sized to that dripper and stay off the paper edge. The kettle and water stream are not sensed. DripLine guides; it does not grade or score the pour.
- Stand-in for the preview: one virtual pour-over setup on a kitchen counter, with a cone dripper about 11 cm across the top, a glass server, and a real-scale coffee-bed disc. Pinching the dripper stands in for “the dripper is detected and I'm starting the brew.” The model is scenery, not recognition. The path is computed from the virtual bed's preset radius; no camera recognition is needed.

## Where things live
- Where the user is looking during the main task: down at the coffee bed, about 60 cm away and about 40 cm below eye level. Start about 1 m in front of the counter, facing the dripper, then walk up and pinch it (default).
- Counter: a simple kitchen counter surface, top about 90 cm high (default), fixed in the virtual room. Nothing is head-locked and no panel floats in front of the face.
- Dripper and server: a cone dripper with an approximately 11 cm top diameter, on a glass server, the setup about 14 cm tall in total, resting on the counter.
- Coffee bed: a disc about 10 cm in diameter, radius 5 cm, near the top of the cone.
- Pour target: a glowing dot about 1.5 cm across (default), warm white/yellow for the additive display. It moves on the bed and its center never goes beyond 4.5 cm from the bed's center. This radius describes the target position; check the visible glow near the edge because the dot has width.
- Pour trail: a thin fading trail about 0.5 cm wide behind the dot, showing the path already poured in this phase. It is attached to the coffee bed and clears at each phase change.
- Bloom ring: a thin glowing ring on the bed, opening to about 2 cm radius during the bloom pour and holding while the coffee blooms.
- Phase ring: a thin ring around the server's base, filling gradually over the current phase instead of counting seconds in numbers. Reset its fill at each phase boundary (default).
- Phase label and tip: one short line of light text on the counter just in front of the server, letters about 2.5 cm tall, angled up toward the user. Show the tip in this line, then retain the short phase label after the tip fades (default); Rest has no text. Check the full line's width and readability in preview.
- Done message: small light text in front of the dripper at about counter height, shown for about 5 seconds, then faded out.

## Hands and input
- Start the brew: pinch the dripper with one hand. This is the only input; the dripper is a big target. The user can then keep both hands on the kettle.
- Restart: pinching the dripper again after Done restarts from Bloom (default). Ignore pinches during an active brew (default).
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: none. No buttons, menus, or voice commands; everything after the starting pinch is timer-driven. Mouse-driven pinch carries the preview demonstration; holding and pouring a kettle is not an input requirement.

## When things show
- Recipe: one cup, fixed; 15 g coffee, 250 g water, total 2:30. Gram figures are recipe targets, not measurements. No numeric countdown appears anywhere; the phase ring filling is the only within-phase time cue.
- Before starting: show the virtual setup and its pinch target; brew guidance waits for the pinch (default).
- Bloom, 0:00–0:45: the pinch shows the bloom ring and starts the dot on a small circle of about 2 cm radius, one loop in about 10 seconds. Show “Bloom — 50 g, small circles.” Fade the tip after about 4 seconds while the guide stays. After the circle, the dot rests, gently pulsing, at the center until 0:45; the bloom ring holds. Clear the bloom ring when Pour 1 starts (default).
- Pour 1, 0:45–1:15: a soft spatial chime sounds. The dot traces a slow spiral from the center out to 4.5 cm and back in over about 30 seconds. Show “Pour to 150 g — slow spiral.” Fade the tip after about 4 seconds; phase label reads “Pour 1.”
- Rest, 1:15–1:30: the dot rests at the center, the trail clears, and no text is shown. No additional chime at Rest (default), following the specified cue schedule.
- Pour 2, 1:30–2:00: a soft spatial chime sounds. The dot traces the same slow spiral again. Show “Pour to 250 g — slow spiral.” Fade the tip after about 4 seconds; phase label reads “Pour 2.”
- Drawdown, 2:00–2:30: a soft spatial chime sounds. The dot and trail disappear. The phase label reads “Drawdown,” and the phase ring fills to completion.
- Done, 2:30: a soft done chime sounds. All guidance clears from the dripper and bed, including the phase ring and label. “Done — enjoy” appears in front of the dripper and fades after about 5 seconds. The dripper becomes ready for a restart pinch (default).
- Trail: clears at every phase change; hidden with the dot during Drawdown and Done.
- If something needs attention out of view: soft chimes from the dripper's position at 0:45, 1:30, and 2:00, plus the done chime at 2:30, so the user need not watch the label.

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pinching the virtual dripper starts the loop: the bloom ring and pour dot appear on the coffee bed, and the phase label reads “Bloom.”
2. During pour windows (0:00–0:10 bloom circle; 0:45–1:15 and 1:30–2:00 spirals) the dot moves along its path and stays within 4.5 cm of the bed's center at all times; during Drawdown the dot and trail are not shown.
3. The phase tip appears at the start of Bloom, Pour 1, and Pour 2, and fades out on its own after about 4 seconds while the guide stays.
4. Phase changes happen at 0:45, 1:30, and 2:00, each with a soft chime from the dripper's position and the phase label updating (Bloom → Pour 1 → Pour 2 → Drawdown), with no user input. The intervening Rest at 1:15–1:30 has no text, as specified above.
5. At 2:30 all guidance clears from the dripper, the done chime plays, the “Done” message appears and fades after about 5 seconds, and pinching the dripper restarts the loop.

## Out of scope
- Recognizing a real dripper or coffee bed with the camera, or sizing the spiral to different drippers automatically.
- Sensing the kettle, water stream, or where the user's water actually lands; scoring or grading the pour.
- Connecting to a scale or thermometer, or tracking grams or temperature in real time; gram figures in tips are recipe targets only.
- Recipe customization, other brew methods, multi-cup brews, and saved preferences.
- Voice commands and mid-brew menus or settings.

## Risks and open questions
- On real glasses, aligning the spiral to a real coffee bed needs the dripper rim detected and tracked while steam rises and the bed swells during the bloom — feel unproven. The preview demonstrates the response to a simulated detection only.
- The user looks down about 60 cm away for 2:30. Check in preview whether the full 11 cm dripper, dot, phase ring, and label stay in the SPECS field of view. Sustained downward viewing and comfort at that distance remain feel unproven.
- The 1.5 cm dot centered at a maximum radius of 4.5 cm can visually extend beyond the 5 cm bed radius. Keep the learner's target dimensions and path; inspect the glow footprint at the edge in preview. Physical pouring accuracy remains feel unproven.
- Heat and steam near the face and hands are real-kitchen questions the preview cannot answer — feel unproven.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- DripLine build order: get pinch → bloom → one spiral pour → done working first, then add the second pour and the rest phase.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
