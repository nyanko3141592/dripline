import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName, nextFrame, sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractableByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {DripLineMain} from '../Scripts/DripLineMain';

// Names verified against authored scene + DripLineMain/LabelUI and live preview.
// Runs use the shipped real-time clock. No writes to private state or timing.
export const object = (name:string) => {
 const found=findSceneObjectByName(name);
 if(!found)throw new Error('Missing scene object: '+name);
 return found;
};
const text=()=>object('DripLine Phase Text').getComponent('Component.Text') as Text;
const dot=()=>object('DripLine Pour Dot');
const bloom=()=>object('DripLine Bloom Ring');
const ring=()=>object('DripLine Phase Ring');
const trailsHidden=()=>{for(let i=0;i<48;i++)expect(object('DripLine Trail '+i).enabled).toBe(false);};
export async function setup(){
 await sleep(1500);
 const main=object('DripLine').getComponent(DripLineMain.getTypeName()) as DripLineMain;
 if(!main)throw new Error('DripLineMain missing');
 // Permit a manually invoked scenario to follow an earlier brew without changing it.
 const deadline=getTime()+160;
 while(main.phase!=='Idle' && main.phase!=='Done'){
  if(getTime()>deadline)throw new Error('Brew did not return to ready');
  await nextFrame();
 }
 return main;
}
export async function pinch(){await new DefaultLeafInteractor().trigger(findInteractableByName('DripLine Dripper'));}
async function until(main:DripLineMain,t:number){
 const deadline=getTime()+t+10;
 while(main.elapsed<t){if(getTime()>deadline)throw new Error('Clock stalled before '+t);await nextFrame();}
}
export async function criterion1(){
 const main=await setup(),count=main.restartCount;
 await pinch();
 expect(main.restartCount).toBe(count+1);expect(main.phase).toBe('Bloom');
 expect(bloom().enabled).toBe(true);expect(dot().enabled).toBe(true);
 expect(text().text).toBe('Pour; wet grounds');
 await until(main,4.2);expect(text().text).toBe('Bloom');
 print('DripLine criterion 1: pinch, bloom ring/dot and Bloom label PASS');
}
export async function criterion2(){
 const main=await setup();main.startBrew();
 let maxRadius=0,samples=0;const moved=[0,0,0];let previous=dot().getTransform().getLocalPosition();
 while(main.elapsed<121){
  await nextFrame();const t=main.elapsed,p=dot().getTransform().getLocalPosition();
  const radius=Math.sqrt(p.x*p.x+p.z*p.z);maxRadius=Math.max(maxRadius,radius);samples++;
  expect(radius<=4.5001).toBe(true);
  const window=t<10?0:t>=45&&t<75?1:t>=90&&t<120?2:-1;
  if(window>=0){expect(dot().enabled).toBe(true);if(p.sub(previous).length>0.0001)moved[window]++;}
  if(t>=120){expect(dot().enabled).toBe(false);trailsHidden();}
  previous=p;
 }
 moved.forEach(n=>expect(n>20).toBe(true));
 print('DripLine criterion 2: '+JSON.stringify({samples,maxRadius,moved,drawdownHidden:true}));
}
export async function criterion3(){
 const main=await setup();main.startBrew();
 for(const [start,tip,label] of [[0,'Pour; wet grounds','Bloom'],[45,'Follow dot; spiral','Pour 1'],[75,'Rest; let it bloom','Rest'],[90,'Follow dot to 250 g','Pour 2']] as [number,string,string][]){
  await until(main,start+0.2);expect(text().text).toBe(tip);expect(dot().enabled).toBe(true);
  await until(main,start+3.7);expect(text().text).toBe(tip);expect(text().textFill.color.w<0.5).toBe(true);
  await until(main,start+4.2);expect(text().text).toBe(label);expect(dot().enabled).toBe(true);
  print('DripLine criterion 3: '+label+' tip faded at '+main.elapsed.toFixed(3));
 }
}
export async function criterion4(){
 const main=await setup(),chimes=main.chimeCount;main.startBrew();
 const audio=object('DripLine Dripper').getComponent('Component.AudioComponent') as AudioComponent;
 expect(audio.spatialAudio.enabled).toBe(true);
 expect(!!object('Camera Object').getComponent('Component.AudioListenerComponent')).toBe(true);
 for(const [time,name,count] of [[45,'Pour 1',1],[75,'Rest',1],[90,'Pour 2',2],[120,'Drawdown',3]] as [number,string,number][]){
  await until(main,time+0.1);expect(main.phase).toBe(name);expect(main.chimeCount-chimes).toBe(count);
  const entry=main.phaseHistory.find(p=>p.name===name);expect(!!entry).toBe(true);
  expect(Math.abs(entry.time-time)<0.25).toBe(true);expect(entry.ringFill).toBe(0);
  expect(main.phaseProgress<0.02).toBe(true);
  if(name==='Rest'){expect(text().text).toBe('Rest; let it bloom');trailsHidden();}
  else{await until(main,time+4.2);expect(text().text).toBe(name);}
  print('DripLine criterion 4: '+JSON.stringify(entry));
 }
 // Chime invocation/spatial attachment proven; perceived loudness requires listening.
}
export async function criterion5(){
 const main=await setup(),chimes=main.chimeCount;main.startBrew();
 await until(main,150.2);expect(main.phase).toBe('Done');expect(main.chimeCount-chimes).toBe(4);
 expect(dot().enabled).toBe(false);expect(bloom().enabled).toBe(false);expect(ring().enabled).toBe(false);trailsHidden();
 expect(text().text).toBe('Done — enjoy');
 await until(main,154.7);expect(text().textFill.color.w<0.5).toBe(true);
 await sleep(600);expect(text().text).toBe('Pinch dripper: start');
 print('DripLine criterion 5: Done cleanup/chime/message/fade PASS; testing restart pinch');
 const count=main.restartCount;await pinch();expect(main.restartCount).toBe(count+1);
 expect(main.phase).toBe('Bloom');expect(dot().enabled).toBe(true);expect(bloom().enabled).toBe(true);
}
