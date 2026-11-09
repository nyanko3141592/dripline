const audio = require('/Users/takahashinaoki/.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-sfx/tools');
const path = require('path');
const PROJECT_ASSETS_SFX = '/Users/takahashinaoki/Dev/specs-learn-hackathon/CoffeeMaker/Assets/GeneratedSFX';
const result = audio.mix_bus.applyFx(audio.sfx_presets.uiNotify(), {hpf: 120, lpf: 3800, gain: 0.35});
audio.mix_bus.masterChain(result, {normalize: 'peak'});
audio.WavBuilder.write(result, path.join(PROJECT_ASSETS_SFX, 'DripLineDone.wav'));
