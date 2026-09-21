import test from 'node:test';import assert from 'node:assert/strict';function t([x,y,z],m){const w=m[3]*x+m[7]*y+m[11]*z+m[15]||1;return[(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]}
test('identity alignment',()=>assert.deepEqual(t([1,2,3],[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),[1,2,3]));
test('translation alignment',()=>assert.deepEqual(t([1,2,3],[1,0,0,0,0,1,0,0,0,0,1,0,5,-2,1,1]),[6,0,4]));
