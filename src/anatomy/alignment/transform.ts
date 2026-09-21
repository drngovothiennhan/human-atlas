export type Vec3=[number,number,number];
export type Mat4=[number,number,number,number,number,number,number,number,number,number,number,number,number,number,number,number];
export const IDENTITY_4:Mat4=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
export function transformPoint([x,y,z]:Vec3,m:Mat4):Vec3{const w=m[3]*x+m[7]*y+m[11]*z+m[15]||1;return[(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]}
