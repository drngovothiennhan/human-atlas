import test from 'node:test';import assert from 'node:assert/strict';import {validateContent,lookupByCode,searchRecords,isFinite3} from '../scripts/content-lib.mjs';
test('licensed content validates',()=>{const r=validateContent();assert.deepEqual(r.errors,[]);assert.equal(r.counts.meridians,14);assert.equal(r.counts.acupoints,0)});
test('lookup is case insensitive',()=>assert.equal(lookupByCode([{code:'LU'}],'lu')?.code,'LU'));
test('Vietnamese search is accent insensitive',()=>assert.equal(searchRecords([{code:'SP',vietnameseName:'Kinh Tỳ'}],'ty').length,1));
test('coordinates reject non-finite values',()=>{assert.equal(isFinite3([1,2,3]),true);assert.equal(isFinite3([1,Infinity,3]),false)});
