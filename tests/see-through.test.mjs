import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveLayerOpacity,DEFAULT_LAYER_OPACITY} from '../app/anatomy.ts';

const base={visible:['integumentary'],opacity:DEFAULT_LAYER_OPACITY};

test('skin stays opaque when nothing under it is picked or shown', () => {
  assert.equal(effectiveLayerOpacity(base,'integumentary'),100);
});

test('picking a structure under the skin (e.g. a bone) makes the skin see-through', () => {
  assert.equal(effectiveLayerOpacity({...base,seeThrough:true},'integumentary'),12);
  assert.equal(effectiveLayerOpacity({...base,seeThrough:true},'skeletal'),100);
});

test('showing another system still makes the skin see-through (unchanged behaviour)', () => {
  assert.equal(effectiveLayerOpacity({...base,visible:['integumentary','skeletal']},'integumentary'),12);
});

test('user opacity override for skin is still respected when see-through', () => {
  assert.equal(effectiveLayerOpacity({...base,seeThrough:true,opacityOverrides:['integumentary']},'integumentary'),100);
});
