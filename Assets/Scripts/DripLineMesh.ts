// Centimeter vessel profiles, swept handles, and animated guide geometry.
export function mesh(vertices: number[], indices: number[]): RenderMesh {
  const b = new MeshBuilder([{name:'position',components:3},{name:'normal',components:3,normalized:true}]);
  b.topology=MeshTopology.Triangles; b.indexType=MeshIndexType.UInt16;
  b.appendVerticesInterleaved(vertices); b.appendIndices(indices); b.updateMesh(); return b.getMesh();
}
export function lathe(profile: number[][], segments=64): RenderMesh {
  const v:number[]=[], ix:number[]=[];
  for(let j=0;j<profile.length;j++) for(let i=0;i<=segments;i++) {
    const a=i/segments*Math.PI*2; v.push(profile[j][0]*Math.cos(a),profile[j][1],profile[j][0]*Math.sin(a),Math.cos(a),0,Math.sin(a));
  }
  for(let j=0;j<profile.length-1;j++) for(let i=0;i<segments;i++) {
    const a=j*(segments+1)+i,b=a+segments+1; ix.push(a,b,a+1,a+1,b,b+1);
  }
  return mesh(v,ix);
}
// +X-facing semicircular handle in the XY plane. Lean follows vessel taper.
export function tubeArc(radius:number,tubeRadius:number,lean=0,segments=48,sides=16,startAngle=-Math.PI/2,endAngle=Math.PI/2):RenderMesh {
 const v:number[]=[],ix:number[]=[];
 for(let i=0;i<=segments;i++){
  const a=startAngle+(endAngle-startAngle)*i/segments,c=Math.cos(a),s=Math.sin(a);
  const tx=-s+lean*c,ty=c,n=Math.sqrt(tx*tx+ty*ty);
  for(let j=0;j<=sides;j++){
   const b=j/sides*Math.PI*2,cb=Math.cos(b),sb=Math.sin(b);
   const nx=ty/n*cb,ny=-tx/n*cb;
   v.push(radius*(c+lean*s)+tubeRadius*nx,radius*s+tubeRadius*ny,tubeRadius*sb,nx,ny,sb);
  }
 }
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){
  const a=i*(sides+1)+j,b=a+sides+1;ix.push(a,a+1,b,a+1,b+1,b);
 }
 // End caps are embedded in the vessel wall but keep the handle a closed solid.
 for(const end of [0,segments]){
  const a=startAngle+(endAngle-startAngle)*end/segments,c=Math.cos(a),s=Math.sin(a),sign=end===0?-1:1;
  const tx=-s+lean*c,ty=c,n=Math.sqrt(tx*tx+ty*ty),k=v.length/6;
  v.push(radius*(c+lean*s),radius*s,0,sign*tx/n,sign*ty/n,0);
  for(let j=0;j<sides;j++){const q=end*(sides+1)+j;if(end===0)ix.push(k,q+1,q);else ix.push(k,q,q+1);}
 }
 return mesh(v,ix);
}
export function disc(radius:number):RenderMesh {return lathe([[0,0],[radius,0]]);}
export function ring(radius:number,width:number):RenderMesh {return lathe([[radius-width/2,0],[radius+width/2,0]]);}
export function quad(w:number,d:number):RenderMesh {return mesh([-w/2,0,-d/2,0,1,0,-w/2,0,d/2,0,1,0,w/2,0,d/2,0,1,0,w/2,0,-d/2,0,1,0],[0,1,2,0,2,3]);}
export function box(w:number,h:number,d:number):RenderMesh {
 const v:number[]=[],ix:number[]=[]; const x=w/2,y=h/2,z=d/2;
 const face=(p:number[][],n:number[])=>{const k=v.length/6;p.forEach(a=>v.push(...a,...n));ix.push(k,k+1,k+2,k,k+2,k+3);};
 face([[x,-y,-z],[x,y,-z],[x,y,z],[x,-y,z]],[1,0,0]);
 face([[-x,-y,z],[-x,y,z],[-x,y,-z],[-x,-y,-z]],[-1,0,0]);
 face([[-x,y,-z],[-x,y,z],[x,y,z],[x,y,-z]],[0,1,0]);
 face([[-x,-y,z],[-x,-y,-z],[x,-y,-z],[x,-y,z]],[0,-1,0]);
 face([[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]],[0,0,1]);
 face([[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]],[0,0,-1]);return mesh(v,ix);
}
export function visual(obj:SceneObject,shape:RenderMesh,material:Material,color:vec4):RenderMeshVisual {
 const v=obj.createComponent('Component.RenderMeshVisual');v.mesh=shape;v.mainMaterial=material.clone();v.mainMaterial.mainPass.baseColor=color;v.mainMaterial.mainPass.twoSided=true;return v;
}
export function child(parent:SceneObject,name:string,pos:vec3):SceneObject {
 const o=global.scene.createSceneObject(name);o.setParent(parent);o.getTransform().setLocalPosition(pos);return o;
}

// One retained mesh: smoothly sweep the arc without allocating a mesh per frame.
export class PhaseArc {
 private builder:MeshBuilder;
 private segments=64;
 constructor(private radius:number,private width:number){
  this.builder=new MeshBuilder([{name:'position',components:3},{name:'normal',components:3,normalized:true}]);
  this.builder.topology=MeshTopology.Triangles;this.builder.indexType=MeshIndexType.UInt16;
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=this.segments;i++) vertices.push(0,0,0,0,1,0,0,0,0,0,1,0);
  for(let i=0;i<this.segments;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
  this.builder.appendVerticesInterleaved(vertices);this.builder.appendIndices(indices);this.setFill(0);
 }
 getMesh(){return this.builder.getMesh();}
 setFill(fill:number){
  const f=Math.max(0,Math.min(1,fill));
  for(let i=0;i<=this.segments;i++){
   const a=-Math.PI/2+i/this.segments*Math.PI*2*f;
   for(let side=0;side<2;side++){const r=this.radius+(side-0.5)*this.width;this.builder.setVertexInterleaved(i*2+side,[r*Math.cos(a),0,r*Math.sin(a),0,1,0]);}
  }
  this.builder.updateMesh();
 }
}

