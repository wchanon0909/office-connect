const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},console};vm.createContext(context);
for(const file of ['layout-studio.js','floor-shapes.js','floor-editor.js','motion.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const {OC667_SHAPES:S,OC666_FLOOR:F,OC612_STUDIO:G,OC54_MOTION:M}=context.window;
const plan=()=>({version:1,cols:10,rows:10,nextId:2,cells:{},edges:{}});
let passed=0;function test(label,fn){fn();passed++;console.log('PASS',label);}
for(const type of ['roundTable','longTable','stairs','doubleDoor'])for(const rotation of [0,90,180,270]){
 if(type==='roundTable'&&rotation!==0)continue;
 test(`${type} ${rotation}: footprint, move, rotate and whole erase`,()=>{
  const p=plan(),before=JSON.stringify(p),[w,h]=S.dims(type,rotation),q=F.apply(p,type,'2,2','2,2',{rotation});
  assert.equal(q.applied,w*h);assert.equal(JSON.stringify(p),before);S.validate(q.plan);
  const b=S.block(q.plan,`2,${2+h-1}`);assert.equal(b.keys.length,w*h);
  assert.equal(F.apply(q.plan,'desk','2,2','2,2').applied,0);
  const moved=F.moveBlock(q.plan,b.keys.at(-1),'5,5');assert.ok(moved);S.validate(moved);
  assert.equal(Object.keys(F.apply(moved,'erase','5,5','5,5').plan.cells).length,0);
  if(type!=='roundTable'){const r=F.rotateBlock(q.plan,b.keys.at(-1));assert.ok(r);S.validate(r);assert.equal(S.block(r,'2,2').rotation,(rotation+90)%360);}
  const edge=F.apply(p,type,'9,9','9,9',{rotation});assert.equal(edge.applied,0);
 });
}
test('Incomplete composite objects cannot be imported',()=>{for(const type of S.kinds){const p=plan();p.cells['2,2']={type,rotation:0,part:0};assert.throws(()=>S.validate(p));}});
test('Cut and restore floor, retain desks and remove orphan windows',()=>{
 const p=plan();p.cells['0,0']={type:'desk',id:'D-001',rotation:0,name:'Owner'};p.edges['N:1']={type:'window'};
 const q=F.apply(p,'cutFloor','0,0','2,2',{mode:'box',protectedIds:new Set(['D-001'])});assert.equal(q.blocked,1);assert.equal(q.applied,8);assert.equal(q.plan.cells['0,0'].id,'D-001');assert.equal(q.plan.edges['N:1'],undefined);
 assert.equal(F.apply(q.plan,'desk','1,1','1,1').applied,0);assert.equal(F.apply(q.plan,'erase','1,1','1,1').plan.cells['1,1'].type,'void');
 const restored=F.apply(q.plan,'restoreFloor','0,0','2,2',{mode:'box'});assert.equal(restored.applied,8);assert.equal(restored.plan.cells['0,0'].id,'D-001');assert.equal(restored.plan.cells['1,1'],undefined);
});
test('Cannot cut the entire floor',()=>{assert.equal(F.apply(plan(),'cutFloor','0,0','9,9',{mode:'box'}).applied,0);});
test('Furniture cannot be partially cut or overwritten',()=>{const q=F.apply(plan(),'roundTable','2,2','2,2').plan;assert.equal(F.apply(q,'cutFloor','2,2','2,2').applied,0);assert.equal(F.apply(q,'doubleDoor','2,2','2,2').applied,0);});
test('Cut floor, long tables and stairs block visual paths',()=>{for(const type of ['roundTable','longTable','stairs','cutFloor']){const p=F.apply(plan(),type,'2,2','2,2').plan,field=M.clearance(p,()=>[0,0],()=>[0,0]);assert.equal(field.free(2,2),false);assert.equal(field.segment({x:1,y:2},{x:3,y:2}),false);}});
test('Double door posts and opening agree in all orientations',()=>{for(const r of [0,90,180,270]){const p=F.apply(plan(),'doubleDoor','2,2','2,2',{rotation:r}).plan,b=S.block(p,'2,2'),line=S.doorLine(b),field=M.clearance(p,()=>[0,0],()=>[0,0]);assert.equal(field.free(line.x,line.y),true);for(const post of S.doorPosts(b))assert.equal(field.free(post.x,post.y),false);assert.equal(M.keyboardCell(p,2,2,field),'door');}});
test('Slab area excludes arbitrary cutouts and every stairwell',()=>{let p=F.apply(plan(),'cutFloor','0,0','1,1',{mode:'box'}).plan;p=F.apply(p,'stairs','3,3','3,3').plan;p=F.apply(p,'stairs','6,6','6,6').plan;const pieces=S.slabRects(p),area=pieces.reduce((n,b)=>n+b.w*b.h,0);assert.equal(area,100-4-12);assert.equal(S.stairs(p).length,2);for(const b of pieces)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)assert.ok(S.hasFloor(p,x,y)&&!G.reserved(p,x,y));});
test('Expansion and resize preserve complete object groups',()=>{const p=F.apply(plan(),'longTable','2,2','2,2').plan,q=F.extend(p,'N',2).plan;S.validate(q);assert.ok(S.block(q,'2,4'));const outside=F.trimBlocks(p,3,10);assert.ok(outside.includes('2,2')&&outside.includes('3,2'));});
console.log(`${passed} floor shape regression groups passed`);
