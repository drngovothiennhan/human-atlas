import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const readScene=()=>readFile(new URL('../app/scene.tsx',import.meta.url),'utf8');

test('scene backdrop is a light vertical gradient set as scene.background',async()=>{
  const source=await readScene();
  assert.match(source,/createLinearGradient\(0,0,0,256\)/);
  assert.match(source,/scene\.background=backdropTexture/);
  assert.match(source,/backdropTexture\.colorSpace=T\.SRGBColorSpace/);
});

test('ground contact shadow is a transparent blurred disc under the platform',async()=>{
  const source=await readScene();
  assert.match(source,/createRadialGradient\(64,64,0,64,64,64\)/);
  assert.match(source,/name='hiu-contact-shadow'/);
  assert.match(source,/depthWrite:false/);
  assert.match(source,/contactShadow\.position\.y=-\.0182/);
});

test('scene disposes the textures it creates on unmount',async()=>{
  const source=await readScene();
  assert.match(source,/backdropTexture\.dispose\(\);contactTexture\.dispose\(\)/);
});
