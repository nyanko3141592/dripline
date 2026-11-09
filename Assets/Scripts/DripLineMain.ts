import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import {DripLineLabelUI} from './DripLineLabelUI';
import {DripLineTiming as T,DripLineDimensions as D,DripLinePhase,DripLinePhases,BrewPhase} from './DripLineSceneContracts';
import {box,lathe,tubeArc,disc,ring,quad,visual,child,PhaseArc} from './DripLineMesh';
@component
export class DripLineMain extends BaseScriptComponent {
 @input @hint('Authored counter at 88 cm; top is 90 cm') counter:SceneObject;
 @input @hint('Authored server base on the counter') server:SceneObject;
 @input @hint('Authored cone base, also the SIK target') dripper:SceneObject;
 @input @hint('Authored coffee bed surface') bed:SceneObject;
 @input @hint('Passive counter label UI') labelUI:DripLineLabelUI;
 @input @hint('Unlit stand-in and guide material') material:Material;
 @input @hint('Soft completion cue') chime:AudioTrackAsset;
 @input @hint('Completion chime volume') @widget(new SliderWidget(0,1,0.05)) chimeVolume:number=0.25;
 @input @hint('Show the large pinch collider for debugging') debugColliders:boolean=false;
 public phase:DripLinePhase='Idle';
 public elapsed:number=0;
 public dotRadius:number=0;
 public guidanceVisible:boolean=false;
 public trailVisible:boolean=false;
 public restartCount:number=0;
 public phaseProgress=0; public chimeCount=0; public phaseHistory:{name:string,time:number,ringFill:number,chimeCount:number}[]=[];
 private coffeeLiquid:SceneObject;
 private pourStream:SceneObject;
 private steam:{o:SceneObject,v:RenderMeshVisual,alpha:number}[]=[];
 private phaseIndex=-1; private phaseRing:SceneObject; private phaseArc:PhaseArc;
 private started=0; private ready=false; private dot:SceneObject; private bloom:SceneObject;
 private dotVisual:RenderMeshVisual; private dripperVisual:RenderMeshVisual; private audio:AudioComponent;
 private trail:{o:SceneObject,v:RenderMeshVisual,time:number}[]=[];
 private trailIndex=0;private lastSample=-1; private previous=new vec3(0,0.08,0);
 onAwake(){
  this.createEvent('OnStartEvent').bind(()=>this.initialize());this.createEvent('UpdateEvent').bind(()=>this.update());
  // Narrow preview-only verification bridge; calls the exact SIK start entry point.
  if(global.deviceInfoSystem.isEditor()) this.createEvent('MessageEvent' as unknown as 'SceneEvent').bind((event:any)=>{
   if(event.data && event.data.type==='DripLineStart') this.startBrew();
  });
 }
 private initialize(){
  if(!this.counter||!this.server||!this.dripper||!this.bed||!this.labelUI||!this.material||!this.chime){print('DripLine: waiting for authored input wiring');return;}
  const ceramic=new vec4(0.96,0.93,0.88,1),glass=new vec4(0.88,0.94,0.96,0.32);
  visual(this.counter,box(110,4,60),this.material,new vec4(0.58,0.45,0.32,1));
  for(const x of [-48,48]) for(const z of [-23,23]) visual(child(this.counter,'Counter leg',new vec3(x,-44,z)),box(4,84,4),this.material,new vec4(0.36,0.29,0.22,1));
  // Warm kitchen envelope; counter authored at (0,88,-130).
  visual(child(this.counter,'Kitchen wall',new vec3(0,87,-31.5)),box(300,170,2),this.material,new vec4(0.71,0.67,0.60,1));
  visual(child(this.counter,'Kitchen backsplash',new vec3(0,15,-30.4)),box(300,26,0.6),this.material,new vec4(0.56,0.51,0.45,1));
  visual(child(this.counter,'Kitchen floor',new vec3(0,-87.7,-40)),quad(520,420),this.material,new vec4(0.36,0.32,0.28,1));
  // Layered contact shading, all clones of the existing unlit material.
  for(let i=0;i<3;i++){
   const halo=child(this.server,'Set contact shadow '+i,new vec3(0,[0.012,0.02,0.028][i],0));
   halo.getTransform().setLocalScale(new vec3(1.15,1,1));
   visual(halo,disc([13,15.5,18][i]),this.material,new vec4(0.05,0.04,0.03,[0.16,0.11,0.07][i]));
   visual(child(this.counter,'Kettle contact shadow '+i,new vec3(-20,[2.012,2.02,2.028][i],-10)),disc([5.6,6.4,7.2][i]),this.material,new vec4(0.05,0.04,0.03,[0.17,0.12,0.08][i]));
  }
  const charcoal=new vec4(0.22,0.22,0.235,1),walnut=new vec4(0.36,0.25,0.17,1);
  // Tall kettle remains rear-left, clear of the mat and pinch collider.
  const kettle=child(this.counter,'Gooseneck kettle',new vec3(-20,2,-10));
  visual(kettle,lathe([[0,0],[3.9,0],[4.7,0.35],[5.0,1.4],[5.05,3.2],[4.95,5.5],[4.7,7.8],[4.3,9.8],[3.8,11.4],[3.15,12.6],[2.8,13.3],[2.75,13.9],[0,13.9]]),this.material,charcoal);
  visual(child(kettle,'Kettle lid',vec3.zero()),lathe([[0,13.9],[2.9,13.9],[3.0,14.15],[2.65,14.4],[0,14.4]]),this.material,new vec4(0.31,0.31,0.32,1));
  visual(child(kettle,'Kettle lid knob',vec3.zero()),lathe([[0,14.4],[0.95,14.45],[1.05,14.8],[0.8,15.25],[0.42,15.55],[0,15.6]]),this.material,walnut);
  // Wide walnut loop: upper/lower attachments follow the tapered body.
  const handle=child(kettle,'Kettle handle',new vec3(-4.3,8.2,0));
  handle.getTransform().setLocalRotation(quat.angleAxis(Math.PI,vec3.up()));
  handle.getTransform().setLocalScale(new vec3(1.28,1,1));
  visual(handle,tubeArc(3.6,0.5,-0.17),this.material,walnut);
  // Three tangent circular arcs: low departure, long rise, downturned lip.
  const spoutJoinAngle=2.55,spoutRiseRadius=12.03;
  const spoutJoinX=7.2+spoutRiseRadius*(1+Math.cos(spoutJoinAngle));
  const spoutJoinY=5.4+spoutRiseRadius*Math.sin(spoutJoinAngle);
  visual(child(kettle,'Kettle low spout',new vec3(4.2,5.4,0)),tubeArc(3,0.55,0,40,20,-Math.PI/2,0.025),this.material,charcoal);
  visual(child(kettle,'Kettle rising spout',new vec3(7.2+spoutRiseRadius,5.4,0)),tubeArc(spoutRiseRadius,0.42,0,56,20,Math.PI+0.008,spoutJoinAngle-0.008),this.material,charcoal);
  visual(child(kettle,'Kettle overcurve',new vec3(spoutJoinX-1.1*Math.cos(spoutJoinAngle),spoutJoinY-1.1*Math.sin(spoutJoinAngle),0)),tubeArc(1.1,0.30,0,40,20,spoutJoinAngle+0.04,0),this.material,charcoal);
  const collar=child(kettle,'Kettle spout collar',new vec3(4.2,2.4,0));
  collar.getTransform().setLocalRotation(quat.angleAxis(-Math.PI/2,vec3.forward()));
  visual(collar,lathe([[0,0],[0.8,0],[0.8,0.5],[0.58,1.1],[0,1.1]]),this.material,charcoal);
  for(const z of [-14,14])visual(child(this.counter,'Counter plank seam',new vec3(0,2.02,z)),box(110,0.06,0.3),this.material,new vec4(0.47,0.35,0.24,1));
  for(let i=0;i<3;i++){
   const o=child(this.dripper,'DripLine Steam '+i,new vec3(0,6.9,0)),alpha=[0.10,0.07,0.05][i];
   const v=visual(o,disc([1.2,1.7,2.3][i]),this.material,new vec4(0.95,0.97,1,alpha));
   v.mainMaterial.mainPass.depthWrite=false;o.enabled=false;this.steam.push({o,v,alpha});
  }
  // Mat rests on the counter; scale overlaps its underside and its top stays at 0.6.
  visual(child(this.server,'Coffee mat',new vec3(0,0.09,0)),box(30,0.18,26),this.material,new vec4(0.30,0.26,0.22,1));
  visual(child(this.server,'Coffee scale',new vec3(0,0.3,0)),box(15,0.6,15),this.material,new vec4(0.16,0.16,0.17,1));
  visual(child(this.server,'Scale display',new vec3(-0.5,0.31,7.52)),box(6,0.35,0.06),this.material,new vec4(0.72,0.93,1,1));
  for(const x of [3.2,3.9])visual(child(this.server,'Scale button',new vec3(x,0.31,7.52)),box(0.35,0.35,0.06),this.material,new vec4(0.45,0.45,0.47,1));
  // Raised base, rounded belly, narrow shoulder and rolled opening; rim stays at 7.5.
  visual(this.server,lathe([[0,0.6],[3.1,0.6],[3.65,0.68],[4.05,0.95],[4.25,1.35],[4.35,2.1],[4.34,2.9],[4.18,3.7],[3.9,4.4],[3.5,5.05],[2.95,5.65],[2.58,6.15],[2.55,6.8],[2.64,7.25],[2.82,7.43],[2.82,7.5],[2.6,7.5],[2.43,7.25],[2.36,6.8],[2.4,6.2],[2.8,5.7],[3.32,5.1],[3.72,4.4],[4,3.7],[4.15,2.85],[4.16,2.1],[4.04,1.4],[3.8,1.05],[3.45,0.86],[0,0.86]]),this.material,glass);
  visual(child(this.server,'Carafe glass handle',new vec3(3.35,4.9,0)),tubeArc(1.3,0.24,-0.54),this.material,glass);
  const spout=child(this.server,'Carafe pouring lip',new vec3(-2.45,7.05,0));
  spout.getTransform().setLocalRotation(quat.angleAxis(0.65,vec3.forward()));
  visual(spout,lathe([[0.38,0],[0.49,0.32],[0.55,0.48],[0.43,0.48],[0.28,0.08],[0.38,0]]),this.material,glass);
  this.coffeeLiquid=child(this.server,'Coffee liquid',new vec3(0,0.9,0));
  visual(this.coffeeLiquid,lathe([[0,0],[3.35,0],[3.5,0.06],[3.6,0.24],[3.6,0.97],[3.55,1],[0,1]]),this.material,new vec4(0.15,0.07,0.02,0.97));
  this.coffeeLiquid.getTransform().setLocalScale(new vec3(1,0.35,1));
  // Foot and three soft ribs give the cone a ceramic silhouette. Inner lip clears r=5.
  this.dripperVisual=visual(this.dripper,lathe([[1.25,0],[2.05,0],[2.18,0.12],[2.18,0.28],[2.04,0.42],[1.62,0.48],[1.76,0.8],[2.14,1.35],[2.36,1.62],[2.39,1.78],[2.42,1.94],[2.8,2.5],[3.16,2.96],[3.25,3.16],[3.25,3.3],[3.32,3.43],[3.7,3.95],[4.06,4.44],[4.16,4.64],[4.15,4.78],[4.22,4.92],[4.62,5.45],[4.96,5.92],[5.18,6.16],[5.43,6.27],[5.5,6.4],[5.46,6.5],[5.12,6.5],[5.07,6.37],[4.92,6.13],[4.55,5.64],[4.12,5.03],[3.7,4.43],[3.27,3.81],[2.83,3.18],[2.4,2.55],[1.97,1.91],[1.55,1.25],[1.15,0.55],[1.05,0.2],[1.25,0]]),this.material,ceramic);
  visual(child(this.dripper,'Ceramic loop handle',new vec3(3.7,4.2,0)),tubeArc(1.5,0.32,0.68),this.material,ceramic);
  visual(this.bed,disc(D.bedRadius),this.material,new vec4(0.44,0.29,0.16,1));
  this.pourStream=child(this.bed,'DripLine Pour Stream',vec3.zero());
  visual(this.pourStream,lathe([[0.21,0.10],[0.16,6],[0.13,12],[0.11,17]]),this.material,new vec4(0.88,0.94,1,0.5));
  this.pourStream.enabled=false;
  this.dot=child(this.bed,'DripLine Pour Dot',new vec3(0,0.09,0));
  this.dotVisual=visual(this.dot,disc(D.dotDiameter/2),this.material,new vec4(1,0.94,0.52,1));
  this.bloom=child(this.bed,'DripLine Bloom Ring',new vec3(0,0.055,0));visual(this.bloom,ring(2,0.12),this.material,new vec4(1,0.85,0.36,0.9));
  for(let i=0;i<48;i++){const o=child(this.bed,'DripLine Trail '+i,new vec3(0,0.07,0));const v=visual(o,quad(D.trailWidth,1),this.material,new vec4(1,0.9,0.43,0));o.enabled=false;this.trail.push({o,v,time:-100});}
  const collider=this.dripper.createComponent('Physics.ColliderComponent');const shape=Shape.createBoxShape();shape.size=new vec3(18,18,18);collider.shape=shape;collider.intangible=true;collider.debugDrawEnabled=this.debugColliders;
  const interactable=this.dripper.createComponent(Interactable.getTypeName()) as Interactable;
  interactable.onTriggerStart.add(()=>this.startBrew());
  interactable.onHoverEnter.add(()=>this.setHover(true));interactable.onHoverExit.add(()=>this.setHover(false));
  // Invisible, forgiving pinch volume above the coffee bed; retain the original target.
  const pinchTarget=child(this.dripper,'DripLine Pinch Target',new vec3(0,8,0));
  const pinchCollider=pinchTarget.createComponent('Physics.ColliderComponent');const pinchShape=Shape.createBoxShape();pinchShape.size=new vec3(26,14,26);pinchCollider.shape=pinchShape;pinchCollider.intangible=true;pinchCollider.debugDrawEnabled=this.debugColliders;
  const pinchInteractable=pinchTarget.createComponent(Interactable.getTypeName()) as Interactable;
  pinchInteractable.onTriggerStart.add(()=>this.startBrew());
  this.phaseRing=child(this.server,'DripLine Phase Ring',new vec3(0,0.67,0));this.phaseArc=new PhaseArc(D.phaseRingRadius,D.phaseRingWidth);visual(this.phaseRing,this.phaseArc.getMesh(),this.material,new vec4(1,0.88,0.42,0.9));
  this.audio=this.dripper.createComponent('Component.AudioComponent');this.audio.audioTrack=this.chime;this.audio.volume=this.chimeVolume;this.audio.playbackMode=Audio.PlaybackMode.LowLatency;this.audio.spatialAudio.enabled=true;
  this.clearGuidance();this.ready=true;print('DripLine ready: pinch dripper');
 }
 private setHover(on:boolean){this.dripperVisual.mainMaterial.mainPass.baseColor=on?new vec4(1,1,0.85,1):new vec4(0.96,0.93,0.88,1);}
 public startBrew(){
  if(!this.ready||(this.phase!=='Idle'&&this.phase!=='Done'))return;
  this.clearGuidance();this.restartCount++;this.started=getTime();this.elapsed=0;this.phaseIndex=-1;this.phaseHistory=[];this.enterPhase(0);this.update();
 }
 private clearTrail(){this.trail.forEach(s=>{s.o.enabled=false;s.time=-100;});this.trailVisible=false;this.lastSample=-1;this.previous=new vec3(0,0.08,0);}
 private clearGuidance(){this.pourStream.enabled=false;this.steam.forEach(w=>w.o.enabled=false);this.dot.enabled=false;this.bloom.enabled=false;this.phaseRing.enabled=false;this.phaseProgress=0;this.phaseArc.setFill(0);this.clearTrail();this.guidanceVisible=false;this.labelUI.setLabel('');}
 private enterPhase(index:number){
  const p=DripLinePhases[index];this.phaseIndex=index;this.phase=p.name;
  this.clearTrail();this.phaseProgress=0;this.phaseArc.setFill(0);
  this.dot.getTransform().setLocalScale(vec3.one());this.moveDot(0,0);
  this.pourStream.enabled=p.guide==='bloom'||p.guide==='spiral';const streamWidth=p.guide==='bloom'?0.55:1;this.pourStream.getTransform().setLocalScale(new vec3(streamWidth,1,streamWidth));
  this.bloom.enabled=p.guide==='bloom';this.dot.enabled=p.guide!=='hidden';
  this.phaseRing.enabled=p.name!=='Done';this.guidanceVisible=p.name!=='Done';
  if(p.chime){this.audio.play(1);this.chimeCount++;print('DripLine chime: '+p.name+' at '+this.elapsed.toFixed(3));}
  if(p.name==='Done')this.clearGuidance();
  this.phaseHistory.push({name:p.name,time:this.elapsed,ringFill:this.phaseProgress,chimeCount:this.chimeCount});
  print('DripLine phase: '+p.name+' at '+this.elapsed.toFixed(3)+'; phase ring reset=0');
 }
 private update(){
  if(!this.ready)return;
  if(this.phase==='Idle'){this.labelUI.setLabel('Pinch dripper: start');return;}
  this.elapsed=getTime()-this.started;
  // The phase table is the sole schedule. Process boundaries in order even after a slow frame.
  while(this.phaseIndex<DripLinePhases.length-1&&this.elapsed>=DripLinePhases[this.phaseIndex+1].start)this.enterPhase(this.phaseIndex+1);
  // Visual-only fill: interior base 0.9 includes the scale's 0.6 cm raise.
  this.coffeeLiquid.getTransform().setLocalScale(new vec3(1,0.35+2.65*Math.max(0,Math.min(1,this.elapsed/150)),1));
  const p=DripLinePhases[this.phaseIndex],t=this.elapsed-p.start;
  this.steam.forEach((w,i)=>{
   w.o.enabled=p.name!=='Done';
   const cycle=(this.elapsed*0.30+i/3)%1,scale=0.7+cycle*0.6;
   w.o.getTransform().setLocalPosition(new vec3(0,6.9+cycle*3.2,0));w.o.getTransform().setLocalScale(new vec3(scale,scale,scale));
   w.v.mainMaterial.mainPass.baseColor=new vec4(0.95,0.97,1,w.alpha*Math.sin(Math.PI*cycle));
  });
  if(p.name==='Done'){
   if(t<T.done)this.labelUI.setLabel('Done — enjoy',Math.min(1,(T.done-t)/T.tipFade));
   else{this.labelUI.setLabel('');this.phase='Idle';print('DripLine ready: restart');}return;
  }
  this.phaseProgress=Math.max(0,Math.min(1,t/(p.end-p.start)));this.phaseArc.setFill(this.phaseProgress);
  if(p.tip&&t<T.tip)this.labelUI.setLabel(p.tip,Math.min(1,(T.tip-t)/T.tipFade));
  else this.labelUI.setLabel(p.name);
  if(p.guide==='bloom'){
   const circle=t<T.bloomCircle,r=circle?2:0,a=2*Math.PI*Math.min(t/T.bloomCircle,1);
   this.moveDot(r*Math.cos(a),r*Math.sin(a));
   const pulse=circle?1:1+0.08*Math.sin((t-T.bloomCircle)*Math.PI*2);this.dot.getTransform().setLocalScale(new vec3(pulse,1,pulse));
   const opening=Math.min(1,t/0.8);this.bloom.getTransform().setLocalScale(new vec3(opening,1,opening));
  }else if(p.guide==='spiral'){
   const r=D.targetRadius*Math.sin(Math.PI*this.phaseProgress),a=this.phaseProgress*Math.PI*8;
   const pos=new vec3(r*Math.cos(a),0.08,r*Math.sin(a));this.moveDot(pos.x,pos.z);this.updateTrail(pos,this.elapsed);
  }else if(p.guide==='rest')this.moveDot(0,0);
 }
 private moveDot(x:number,z:number){this.pourStream.getTransform().setLocalPosition(new vec3(x,0,z));this.dot.getTransform().setLocalPosition(new vec3(x,0.09,z));this.dotRadius=Math.sqrt(x*x+z*z);}
 private updateTrail(pos:vec3,t:number){
  if(this.lastSample<0||t-this.lastSample>=0.07){
   const delta=pos.sub(this.previous),length=delta.length;if(length>0.001){const s=this.trail[this.trailIndex++%this.trail.length];s.time=t;s.o.enabled=true;
    s.o.getTransform().setLocalPosition(pos.add(this.previous).uniformScale(0.5));s.o.getTransform().setLocalScale(new vec3(1,1,length+0.02));s.o.getTransform().setLocalRotation(quat.angleAxis(Math.atan2(delta.x,delta.z),vec3.up()));}
   this.previous=pos;this.lastSample=t;
  }
  this.trailVisible=true;
  this.trail.forEach(s=>{const alpha=Math.max(0,1-(t-s.time)/2.8)*0.7;s.o.enabled=alpha>0;s.v.mainMaterial.mainPass.baseColor=new vec4(1,0.9,0.43,alpha);});
 }
}

// Design polish: optional glass streak intentionally omitted.
