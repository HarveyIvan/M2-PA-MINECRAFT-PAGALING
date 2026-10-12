import * as THREE from '../vendor/three/three.module.js';
import {textures} from './textures.js';

export const scene=new THREE.Scene();
scene.background=new THREE.Color('#a78589');scene.fog=new THREE.Fog('#a78589',55,140);
export const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.1,220);
export let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:document.querySelector('#world'),antialias:true,preserveDrawingBuffer:true});}
catch(error){document.querySelector('#error').textContent='WebGL 2 is unavailable. Use a browser with hardware acceleration enabled.';document.querySelector('#error').hidden=false;throw error;}
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const materials={};for(const [key,map] of Object.entries(textures))materials[key]=new THREE.MeshLambertMaterial({map});
const grassBlock=[materials.dirt,materials.dirt,materials.grass,materials.dirt,materials.dirt,materials.dirt];
const waterMaterial=new THREE.MeshPhongMaterial({map:textures.water,color:'#7aa9db',transparent:true,opacity:0.86,shininess:90});
const flameMaterial=new THREE.MeshBasicMaterial({color:'#ffd764'});
const leafMaterial=new THREE.MeshLambertMaterial({color:'#76603f'});
const stoneMaterial=new THREE.MeshStandardMaterial({color:'#c1beb0',roughness:1});
const cubeGeometry=new THREE.BoxGeometry(1,1,1);
const batches=new Map();
function voxel(key,x,y,z){if(!batches.has(key))batches.set(key,[]);batches.get(key).push([x,y,z]);}
function box(name,w,h,d,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}

// A fixed block grid. Layers expose grass-over-dirt terraces beside the stream.
for(let x=-18;x<=18;x++)for(let z=-12;z<=12;z++){
  const river=z>=8&&z<=10;
  const terrace=!river&&((x>2&&z>-2)||(x<-6&&z<0));
  voxel('dirt',x,-1.5,z);
  if(!river){voxel(terrace?'grass':'sand',x,-0.5,z);if(terrace)voxel(z>=4?'grass':'sand',x,0.5,z);}
}
export const water=box('Stream',37,0.12,3,waterMaterial,0,-0.58,9);
for(let x=-18;x<=18;x++)if(x%3===0)voxel('sand',x,-0.5,11);

// Blocky desert backdrop. Heights rise toward the upper-right of the reference.
for(let x=-24;x<=28;x++)for(let z=-28;z<=-13;z++){
 const height=Math.max(0,Math.floor((x+24)/10+Math.sin(x*0.36+z*0.4)*1.2+(z<-20?1:0)));
 for(let y=-1;y<height;y++)voxel('sand',x,y+0.5,z);
}

function tower(x,z,w=5,d=4,height=6){
 for(let i=0;i<w;i++)for(let k=0;k<d;k++)for(let y=0;y<height;y++){
   const edge=i===0||i===w-1||k===0||k===d-1;
   const door=k===d-1&&i===Math.floor(w/2)&&y<2;
   const slit=(i===0||i===w-1)&&k===2&&y===height-2;
   if(edge&&!door&&!slit)voxel('sandstone',x+i,1.5+y,z+k);
 }
 for(let i=0;i<w;i++)for(let k=0;k<d;k++)voxel('sandstone',x+i,height+1.5,z+k);
 for(let i=0;i<w;i++)for(let k=0;k<d;k++)if((i===0||i===w-1||k===0||k===d-1)&&(i+k)%2===0)voxel('sandstone',x+i,height+2.5,z+k);
 box('Wooden door',0.82,1.9,0.12,materials.wood,x+Math.floor(w/2),1.95,z+d-0.42);
 box('Door handle',0.12,0.12,0.1,flameMaterial,x+Math.floor(w/2)+0.25,1.9,z+d-0.33);
}
tower(-13,-8,6,5,5);tower(-4,-7,4,4,7);
// Central low bell building.
for(let x=2;x<=8;x++)for(let z=-6;z<=-3;z++){
 voxel('sandstone',x,5.5,z);
 if(x===2||x===8||z===-6)for(let y=1;y<5;y++)voxel('sandstone',x,y+0.5,z);
}
box('Bell beam',6.7,0.3,0.4,materials.wood,5,4.8,-2.7);
const bellMaterial=new THREE.MeshPhongMaterial({color:'#e5ae35',shininess:45});
export const bell=box('Village bell',0.75,0.75,0.62,bellMaterial,5.2,4.05,-2.7);
box('Bell cap',0.95,0.16,0.75,bellMaterial,5.2,3.7,-2.7);
box('Bell hanger',0.15,0.5,0.15,materials.wood,5.2,4.55,-2.7);

// Market shelter on the raised right platform, with patterned wares.
for(const x of [9,15])for(const z of [-1,3])for(let y=1;y<=4;y++)voxel('sandstone',x,y+0.5,z);
for(let x=8;x<=16;x++)for(let z=-2;z<=4;z++)voxel('sandstone',x,5.5,z);
box('Market table',4,1,1.5,materials.cloth,12,2,1.7);
for(const x of [11,13])box('Patterned market goods',1.1,0.75,1.1,materials.cloth,x,2.8,1.7);
// Small plants and terracotta-colored pots on the roof.
for(const x of [10,14]){box('Roof flower pot',0.5,0.5,0.5,materials.wood,x,6.2,1);box('Potted cactus',0.3,0.8,0.3,materials.cactus,x,6.75,1);}

const flames=[];
function torch(x,y,z){box('Torch shaft',0.12,0.6,0.12,materials.wood,x,y,z);const flame=box('Animated torch flame',0.22,0.27,0.22,flameMaterial,x,y+0.4,z);flames.push(flame);}
for(const [x,z] of [[-10,4],[7,1],[17,5]]){
 voxel('sandstone',x,1.5,z);voxel('sandstone',x,2.5,z);voxel('wood',x,3.5,z);torch(x,4.2,z);
}
torch(-5,5.1,-4.5);torch(-12,4.5,-3.8);

// Wheat plots with irrigation and sandstone borders.
const wheatMaterial=new THREE.MeshLambertMaterial({color:'#c5b541',side:THREE.DoubleSide});
const wheatGeometry=new THREE.PlaneGeometry(0.42,0.95);
function farm(x,z,w,d,y){
 for(let i=0;i<w;i++)for(let k=0;k<d;k++){
  const edge=i===0||k===0||i===w-1||k===d-1;
  if(edge){voxel('sandstone',x+i,y,z+k);continue;}
  if(k===Math.floor(d/2)){box('Irrigation water',1,0.08,1,waterMaterial,x+i,y-0.42,z+k);continue;}
  box('Tilled soil',1,0.2,1,materials.dirt,x+i,y-0.4,z+k);
  for(const angle of [0,Math.PI/2]){const crop=new THREE.Mesh(wheatGeometry,wheatMaterial);crop.position.set(x+i,y+0.15,z+k);crop.rotation.y=angle;crop.castShadow=true;scene.add(crop);}
 }
}
farm(-9,4,8,4,0.5);farm(-11,-5,6,4,4.5);

// Cacti and angular dry bushes made in the scene, no model loaders.
for(const [x,z,h]of[[-17,-8,3],[-8,-11,4],[19,-10,3],[23,-19,3]])for(let i=0;i<h;i++)voxel('cactus',x,i+1.5,z);
for(const [x,z]of[[16,-8],[-16,2],[3,5],[20,-16],[23,-24]])for(const angle of [-0.7,0.7]){const twig=box('Dry bush',0.07,0.8,0.07,leafMaterial,x,1.4,z);twig.rotation.z=angle;}

// Simplified iron golem matching the large figure near the central doorway.
const golem=new THREE.Group();golem.name='Primitive iron golem';golem.position.set(3.4,1,-1.3);scene.add(golem);
box('Golem body',1.05,1.5,0.6,stoneMaterial,0,1.65,0,golem);box('Golem head',0.65,0.65,0.65,stoneMaterial,0,2.7,0,golem);
box('Golem nose',0.18,0.28,0.2,stoneMaterial,0,2.57,0.41,golem);
for(const x of [-0.28,0.28])box('Golem leg',0.38,0.9,0.45,stoneMaterial,x,0.55,0,golem);
for(const x of [-0.75,0.75])box('Golem arm',0.4,1.85,0.45,stoneMaterial,x,1.55,0,golem);
for(const x of [-0.18,0.18])box('Golem eye',0.1,0.075,0.05,new THREE.MeshBasicMaterial({color:'#a74b36'}),x,2.77,0.34,golem);
box('Golem vine',0.13,0.8,0.03,materials.grass,-0.25,1.7,0.32,golem);
const catMaterial=new THREE.MeshLambertMaterial({color:'#282936'});
const cat=new THREE.Group();cat.position.set(-7.7,0.45,7);cat.rotation.y=0.4;scene.add(cat);
box('Cat body',0.75,0.35,0.3,catMaterial,0,0.25,0,cat);box('Cat head',0.3,0.3,0.3,catMaterial,-0.48,0.4,0,cat);
for(const x of [-0.28,0.28])for(const z of [-0.1,0.1])box('Cat leg',0.1,0.3,0.1,catMaterial,x,0.04,z,cat);
box('Cat tail',0.7,0.08,0.08,catMaterial,0.65,0.3,0,cat);

for(const [key,positions]of batches){
 const material=key==='grass'?grassBlock:materials[key];
 const blocks=new THREE.InstancedMesh(cubeGeometry,material,positions.length);blocks.name=key+' blocks';
 const matrix=new THREE.Matrix4();positions.forEach(([x,y,z],i)=>{matrix.makeTranslation(x,y,z);blocks.setMatrixAt(i,matrix);});
 blocks.castShadow=blocks.receiveShadow=true;scene.add(blocks);
}

// Square sun and slab clouds keep the reference's voxel silhouettes.
const sun=box('Square sunset sun',6,6,0.1,new THREE.MeshBasicMaterial({color:'#fffca0',toneMapped:false}),-30,7,-43);
const cloudMat=new THREE.MeshBasicMaterial({color:'#b7a39e'});
export const clouds=new THREE.Group();scene.add(clouds);
for(let i=0;i<14;i++){const cloud=box('Voxel cloud',5+i%3*2,0.28,3+i%2,cloudMat,-28+i*5,17+i%3,-20-i%4*6,clouds);}

export const lights={fill:new THREE.HemisphereLight('#cad2ee','#665b37',1.4),sun:new THREE.DirectionalLight('#ffbc72',3.2),torch:new THREE.PointLight('#ff923b',30,13,2)};
lights.sun.position.set(-28,15,-23);lights.sun.castShadow=true;lights.sun.shadow.mapSize.set(2048,2048);Object.assign(lights.sun.shadow.camera,{left:-35,right:35,top:30,bottom:-25,near:0.5,far:120});lights.sun.shadow.normalBias=0.035;lights.sun.target.position.set(0,0,0);
lights.torch.position.set(7,4.5,1);for(const light of Object.values(lights))scene.add(light);

// A fixed particle pool with periodic wrapping, so dust never runs out.
const particlePositions=new Float32Array(450*3);
for(let i=0;i<450;i++){particlePositions[i*3]=(Math.random()-0.5)*38;particlePositions[i*3+1]=0.5+Math.random()*8;particlePositions[i*3+2]=(Math.random()-0.5)*28;}
const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
export const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#f4d397',size:0.075,transparent:true,opacity:0.65,depthWrite:false}));dust.name='Drifting desert dust';dust.frustumCulled=false;scene.add(dust);

function setSky(daylight){
 const sky=document.createElement('canvas');sky.width=8;sky.height=256;const ctx=sky.getContext('2d');const gradient=ctx.createLinearGradient(0,0,0,256);
 gradient.addColorStop(0,daylight?'#6ba0d2':'#596a94');gradient.addColorStop(0.52,daylight?'#a7c7e2':'#a88694');gradient.addColorStop(1,daylight?'#d8e5ec':'#ed9859');ctx.fillStyle=gradient;ctx.fillRect(0,0,8,256);
 const old=scene.background;scene.background=new THREE.CanvasTexture(sky);scene.background.colorSpace=THREE.SRGBColorSpace;if(old?.isTexture)old.dispose();scene.fog.color.set(daylight?'#a7c7e2':'#bf9784');
}
setSky(false);
export const state={elapsed:0,paused:false,daylight:false};
const target=new THREE.Vector3(0,3,0);const view={yaw:0.23,pitch:0.24,radius:42};
function updateCamera(){const radius=view.radius*(innerWidth<650?1.65:1);camera.position.set(target.x+Math.sin(view.yaw)*Math.cos(view.pitch)*radius,target.y+Math.sin(view.pitch)*radius,target.z+Math.cos(view.yaw)*Math.cos(view.pitch)*radius);camera.lookAt(target);}
function resetView(){target.set(0,3,0);Object.assign(view,{yaw:0.23,pitch:0.24,radius:42});updateCamera();}
resetView();
let drag;
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.pan){target.x-=dx*0.025;target.y+=dy*0.025;}else{view.yaw-=dx*0.004;view.pitch=THREE.MathUtils.clamp(view.pitch+dy*0.004,0.06,1.25);}drag.x=e.clientX;drag.y=e.clientY;updateCamera();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(event,()=>drag=null);
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();view.radius=THREE.MathUtils.clamp(view.radius+e.deltaY*0.025,16,85);updateCamera();},{passive:false});
document.querySelector('#view').addEventListener('click',resetView);
document.querySelector('#light').addEventListener('click',e=>{state.daylight=!state.daylight;e.currentTarget.setAttribute('aria-pressed',String(state.daylight));e.currentTarget.textContent=state.daylight?'Sunset':'Daylight';lights.fill.intensity=state.daylight?2.1:1.4;lights.sun.color.set(state.daylight?'#fff2d6':'#ffbc72');setSky(state.daylight);});
document.querySelector('#motion').addEventListener('click',e=>{state.paused=!state.paused;e.currentTarget.setAttribute('aria-pressed',String(state.paused));e.currentTarget.textContent=state.paused?'Resume effects':'Pause effects';});
document.querySelector('#compare').addEventListener('click',()=>{renderer.render(scene,camera);document.querySelector('#outputImage').src=renderer.domElement.toDataURL('image/png');document.querySelector('#comparison').showModal();});
document.querySelector('#close').addEventListener('click',()=>document.querySelector('#comparison').close());
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);updateCamera();});
export function step(delta){if(state.paused)return;state.elapsed+=delta;const t=state.elapsed;
 for(let i=0;i<450;i++){const j=i*3;particlePositions[j]=((particlePositions[j]+delta*0.6+19)%38)-19;particlePositions[j+1]=0.5+((particlePositions[j+1]-0.5+delta*0.06)%8);}
 dustGeo.attributes.position.needsUpdate=true;clouds.position.x=Math.sin(t*0.02)*2;water.position.y=-0.58+Math.sin(t*0.8)*0.015;bell.rotation.z=Math.sin(t*0.8)*0.05;
 flames.forEach((flame,i)=>flame.scale.y=0.9+Math.sin(t*9+i)*0.16);lights.torch.intensity=30+Math.sin(t*9)*3;
}
let previous;renderer.setAnimationLoop(time=>{if(previous!==undefined)step(Math.min((time-previous)/1000,0.1));previous=time;renderer.render(scene,camera);});
