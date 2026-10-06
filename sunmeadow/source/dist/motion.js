import * as THREE from 'three';
const tempQ=new THREE.Quaternion();
// Point a joint's child at a world-space target, preserving the actual rig axes.
function aim(joint,child,target){
 joint.updateWorldMatrix(true,true);
 const origin=joint.getWorldPosition(new THREE.Vector3());
 const from=child.getWorldPosition(new THREE.Vector3()).sub(origin),to=target.clone().sub(origin);
 if(from.lengthSq()<1e-8||to.lengthSq()<1e-8)return;
 const delta=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
 const world=joint.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
 const parent=joint.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 joint.quaternion.copy(parent.multiply(world));joint.updateWorldMatrix(false,true);
}
export function makeLegs(model,root){
 const nodes={};model.traverse(b=>{if(b.isBone)nodes[b.name.replace(/_\d+$/,'')]=b;});root.updateWorldMatrix(true,true);
 return ['L','R'].map(side=>{
  const thigh=nodes[side+'Thigh'],knee=nodes[side+'Leg'],foot=nodes[side+'Foot'];if(!thigh||!knee||!foot)return null;
  const a=thigh.getWorldPosition(new THREE.Vector3()),b=knee.getWorldPosition(new THREE.Vector3()),c=foot.getWorldPosition(new THREE.Vector3());
  return {side,thigh,knee,foot,rest:root.worldToLocal(c.clone()),footRotation:root.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(foot.getWorldQuaternion(new THREE.Quaternion())),upper:a.distanceTo(b),lower:b.distanceTo(c)};
 }).filter(Boolean);
}
export function poseLegs(legs,root,phase,strength){
 root.updateWorldMatrix(true,true);
 for(const leg of legs){
  const wave=Math.sin(phase+(leg.side==='L'?0:Math.PI));
  const reach=leg.upper+leg.lower,target=leg.rest.clone();
  target.z+=wave*reach*.34*strength;
  target.y+=Math.pow(Math.max(0,wave),2)*reach*.16*strength;
  const targetWorld=root.localToWorld(target),a=leg.thigh.getWorldPosition(new THREE.Vector3());
  const line=targetWorld.clone().sub(a),d=THREE.MathUtils.clamp(line.length(),Math.abs(leg.upper-leg.lower)+1e-5,reach*.995);
  const direction=line.normalize();targetWorld.copy(a).addScaledVector(direction,d);
  // Bend knees towards the character's front, not sideways or inside-out.
  const pole=new THREE.Vector3(0,0,1).applyQuaternion(root.getWorldQuaternion(tempQ));
  pole.addScaledVector(direction,-pole.dot(direction));if(pole.lengthSq()<1e-6)pole.set(1,0,0);pole.normalize();
  const along=(leg.upper**2-leg.lower**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,leg.upper**2-along**2));
  const kneeTarget=a.clone().addScaledVector(direction,along).addScaledVector(pole,height);
  aim(leg.thigh,leg.knee,kneeTarget);aim(leg.knee,leg.foot,targetWorld);
  const desired=root.getWorldQuaternion(new THREE.Quaternion()).multiply(leg.footRotation);
  leg.foot.quaternion.copy(leg.foot.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(desired));
 }
}
export function entrancePose(time){
 if(time>=2.1)return{height:0,scaleY:1,scaleXZ:1,turn:0,wave:0,done:true};
 const jump=time<.9?Math.sin(Math.PI*THREE.MathUtils.clamp((time-.12)/.78,0,1))*.55:0;
 const landing=time>=.9&&time<1.2?Math.sin((time-.9)/.3*Math.PI):0;
 return {height:jump,scaleY:1-landing*.12,scaleXZ:1+landing*.07,turn:time<.9?Math.sin(time/.9*Math.PI)*.25:0,wave:time>1.15?Math.sin((time-1.15)*Math.PI*5)*.3:0,done:false};
}
