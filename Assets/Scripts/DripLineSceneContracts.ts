// Fixed one-cup recipe. Authored roots use centimeters; all times are seconds.
export const DripLineTiming={bloomCircle:10,tip:4,tipFade:0.8,done:5};
export const DripLineDimensions={bedRadius:5,targetRadius:4.5,dotDiameter:1.5,trailWidth:0.5,phaseRingRadius:4.65,phaseRingWidth:0.12};
export type DripLinePhase='Idle'|'Bloom'|'Pour 1'|'Rest'|'Pour 2'|'Drawdown'|'Done';
export interface BrewPhase {name:DripLinePhase;start:number;end:number;tip:string;chime:boolean;guide:'bloom'|'spiral'|'rest'|'hidden';}
export const DripLinePhases:BrewPhase[]=[
 {name:'Bloom',start:0,end:45,tip:'Pour; wet grounds',chime:false,guide:'bloom'},
 {name:'Pour 1',start:45,end:75,tip:'Follow dot; spiral',chime:true,guide:'spiral'},
 {name:'Rest',start:75,end:90,tip:'Rest; let it bloom',chime:false,guide:'rest'},
 {name:'Pour 2',start:90,end:120,tip:'Follow dot to 250 g',chime:true,guide:'spiral'},
 {name:'Drawdown',start:120,end:150,tip:'Let it draw down',chime:true,guide:'hidden'},
 {name:'Done',start:150,end:155,tip:'',chime:true,guide:'hidden'},
];
