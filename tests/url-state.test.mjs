import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAtlasState,serializeAtlasState} from '../lib/url-state.mjs';

test('atlas URL state round trips deterministic fields',()=>{
  const encoded=serializeAtlasState({mode:'explore',tab:'meridians',query:'ST36'});
  assert.deepEqual(parseAtlasState(encoded),{mode:'explore',tab:'meridians',query:'ST36'});
});
test('empty URL state is stable',()=>assert.deepEqual(parseAtlasState(''),{mode:null,tab:null,query:''}));
