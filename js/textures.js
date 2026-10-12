import * as THREE from '../vendor/three/three.module.js';

function texture(name,base,detail,pattern='noise'){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=16;
  const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,16,16);
  let seed=51;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  ctx.fillStyle=detail;
  for(let i=0;i<100;i++){ctx.globalAlpha=0.15+random()*0.4;ctx.fillRect(Math.floor(random()*16),Math.floor(random()*16),1,1);}
  ctx.globalAlpha=1;
  if(pattern==='brick'){ctx.fillStyle=detail;for(const y of [0,8]){ctx.fillRect(0,y,16,1);ctx.fillRect(y===0?7:0,y,1,8);}}
  if(pattern==='wood'){ctx.fillStyle=detail;for(const y of [0,4,8,12])ctx.fillRect(0,y,16,1);}
  if(pattern==='cactus'){ctx.fillStyle=detail;for(const x of [2,7,12])ctx.fillRect(x,0,1,16);}
  const map=new THREE.CanvasTexture(canvas);map.name=name;map.colorSpace=THREE.SRGBColorSpace;map.magFilter=map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;return map;
}
export const textures={
 sand:texture('Sand','#cabe91','#a79970'),
 sandstone:texture('Sandstone','#d2c79c','#a89b77','brick'),
 dirt:texture('Dirt','#775135','#a77853'),
 grass:texture('Grass','#527538','#83914d'),
 wood:texture('Acacia planks','#925538','#6e3e2b','wood'),
 cactus:texture('Cactus','#3c7132','#244b24','cactus'),
 water:texture('Water','#267ab0','#6bbbd0'),
 cloth:texture('Market cloth','#3b7c98','#dbcc85','brick')
};
