import test from 'node:test';
import assert from 'node:assert/strict';
import {QUALITY_CONFIG,selectInitialProfile,stepAdaptiveProfile} from '../app/render-quality.ts';

const base={webgl:true,webgl2:true,maxTextureSize:16384,hardwareConcurrency:8,deviceMemoryGb:8,devicePixelRatio:2,viewportPixels:2_000_000};

test('manual quality modes are deterministic',()=>{
  assert.equal(selectInitialProfile('economy',base),'economy');
  assert.equal(selectInitialProfile('high',base),'high');
  assert.ok(QUALITY_CONFIG.economy.pixelRatioCap<QUALITY_CONFIG.high.pixelRatioCap);
  assert.ok(QUALITY_CONFIG.economy.flowParticlesPerPath<QUALITY_CONFIG.high.flowParticlesPerPath);
});

test('automatic profile uses browser capabilities with conservative fallbacks',()=>{
  assert.equal(selectInitialProfile('auto',base),'high');
  assert.equal(selectInitialProfile('auto',{...base,deviceMemoryGb:2}),'economy');
  assert.equal(selectInitialProfile('auto',{...base,webgl:false,webgl2:false}),'economy');
  assert.equal(selectInitialProfile('auto',{...base,hardwareConcurrency:4,deviceMemoryGb:4,maxTextureSize:8192}),'balanced');
});

test('measured frame time changes one quality step at a time',()=>{
  assert.equal(stepAdaptiveProfile('high',35),'balanced');
  assert.equal(stepAdaptiveProfile('balanced',35),'economy');
  assert.equal(stepAdaptiveProfile('economy',35),'economy');
  assert.equal(stepAdaptiveProfile('economy',12),'balanced');
  assert.equal(stepAdaptiveProfile('balanced',12),'high');
  assert.equal(stepAdaptiveProfile('high',12),'high');
  assert.equal(stepAdaptiveProfile('balanced',20),'balanced');
});
