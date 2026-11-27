-- V6.6.7 floor shapes. Preserves application rows, ACLs and the current layout.
begin;
set local lock_timeout='3s';
set local statement_timeout='30s';
do $guard$ begin
if md5(regexp_replace(pg_get_functiondef('oc41_private.clean_plan(jsonb)'::regprocedure),'\s','','g')) not in ('cce6431464fd9c424f37537b46f9b3ca','80d3f9ecb57d989a41cc30def0bba52e') then raise exception 'Unexpected schema: oc41_private.clean_plan; inspect before installing';end if;
if md5(regexp_replace(pg_get_functiondef('oc41_private.oc51_cell_type(jsonb,text)'::regprocedure),'\s','','g')) not in ('3acfb1c48a9423072e4759d14e8a5637','c40a3aceb1960ffff01081fa641b5aab') then raise exception 'Unexpected schema: oc41_private.oc51_cell_type; inspect before installing';end if;
if md5(regexp_replace(pg_get_functiondef('oc41_private.oc51_path(jsonb,text,text,boolean)'::regprocedure),'\s','','g')) not in ('2a32a40c05db431be0cb96b0f8569766','0358380e10eb4af220fd4c83a078b6c6') then raise exception 'Unexpected schema: oc41_private.oc51_path; inspect before installing';end if;
if md5(regexp_replace(pg_get_functiondef('oc41_private.oc50_path(jsonb,text,text,boolean)'::regprocedure),'\s','','g')) not in ('fbae3795c7176ccc4aed2577958c039a','614f5bfb782a80975af01571532c5f60') then raise exception 'Unexpected schema: oc41_private.oc50_path; inspect before installing';end if;
if md5(regexp_replace(pg_get_functiondef('oc41_private.oc611_clear(jsonb,double precision,double precision)'::regprocedure),'\s','','g')) not in ('7a0741a34c00f10550a8ba0ef3c6a5c2','1aa0af7298e6c3d12f9275491b75f4f9') then raise exception 'Unexpected schema: oc41_private.oc611_clear; inspect before installing';end if;
if md5(regexp_replace(pg_get_functiondef('public.oc41_snapshot()'::regprocedure),'\s','','g')) not in ('29ab9f8d23d54d58a2973d41e5ed0be2','94f552d0a1abd7cb0e6f632078d81ed8') then raise exception 'Unexpected schema: public.oc41_snapshot; inspect before installing';end if;
end $guard$;

create or replace function oc41_private.oc667_validate(p jsonb) returns boolean
language plpgsql immutable set search_path='' as $fn$
declare e record; c jsonb; k text; t text; r int; part int; x int; y int; w int; h int; xx int; yy int; i int; count_void int:=0;
begin
 for e in select key,value from jsonb_each(p->'cells') loop
  c:=e.value;t:=c->>'type';k:=e.key;
  if t='void' then count_void:=count_void+1;if c->>'rotation'<>'0' then raise exception 'Invalid cutout';end if;end if;
  if t not in ('roundTable','longTable','stairs','doubleDoor') then continue;end if;
  if coalesce(c->>'part','') !~ '^[0-5]$' then raise exception 'Missing object part: %',k;end if;
  part:=(c->>'part')::int;r:=(c->>'rotation')::int;
  w:=case when t='stairs' then 3 else 2 end;h:=case when t in ('stairs','roundTable') then 2 else 1 end;
  if t='roundTable' and r<>0 then raise exception 'Round table rotation must be zero';end if;
  if r%180<>0 then i:=w;w:=h;h:=i;end if;
  x:=split_part(k,',',1)::int-part%w;y:=split_part(k,',',2)::int-part/w;
  if part>=w*h or x<0 or y<0 or x+w>(p->>'cols')::int or y+h>(p->>'rows')::int then raise exception 'Invalid object footprint: %',k;end if;
  for i in 0..w*h-1 loop
   xx:=x+i%w;yy:=y+i/w;
   c:=p->'cells'->(xx::text||','||yy::text);
   if c is null or c->>'type' is distinct from t or c->>'rotation' is distinct from r::text or c->>'part' is distinct from i::text then raise exception 'Incomplete object footprint: %',k;end if;
  end loop;
 end loop;
 if count_void>=(p->>'cols')::int*(p->>'rows')::int then raise exception 'At least one floor cell is required';end if;
 return true;
end $fn$;

create or replace function oc41_private.oc667_legacy_stair(p jsonb, px int, py int) returns boolean
language sql immutable set search_path='' as $fn$
 select exists(select 1 from generate_series(greatest(0,px-2),px) x cross join generate_series(greatest(0,py-1),py) y
 where x+3<=(p->>'cols')::int and y+2<=(p->>'rows')::int
 and not exists(select 1 from generate_series(0,5) i where p->'cells'->((x+i%3)::text||','||(y+i/3)::text)->>'type' is distinct from 'wall'
 or p->'cells'->((x+i%3)::text||','||(y+i/3)::text)->>'rotation' is distinct from case when i%2=0 then '90' else '270' end));
$fn$;
revoke all on function oc41_private.oc667_validate(jsonb) from public,anon,authenticated;
revoke all on function oc41_private.oc667_legacy_stair(jsonb,int,int) from public,anon,authenticated;

CREATE OR REPLACE FUNCTION oc41_private.clean_plan(p jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$

declare x integer; y integer; nx integer; nr integer; n integer; k text; c jsonb; t text; r integer; d text; lab text; seen text[] := array[]::text[]; outcells jsonb := '{}'::jsonb; biggest integer := 0; v_edge_key text; v_edge jsonb; v_edge_index integer; v_edges jsonb:='{}'::jsonb; v_alignment text;

begin

 if p is null or jsonb_typeof(p) <> 'object' or p->>'version' is distinct from '1'

    or coalesce(p->>'cols','') !~ '^[0-9]{1,2}$' or coalesce(p->>'rows','') !~ '^[0-9]{1,2}$'

    or jsonb_typeof(p->'cells') is distinct from 'object' then raise exception 'Invalid layout'; end if;

 if p ? 'wallEdges' then raise exception 'Experimental edge-wall plans are not supported by this release';end if;
nx := (p->>'cols')::integer; nr := (p->>'rows')::integer;

 if nx not between 4 and 80 or nr not between 4 and 50 or pg_column_size(p)>2000000 then raise exception 'Layout size out of range'; end if;

 for k,c in select key,value from jsonb_each(p->'cells') loop

  if k !~ '^(0|[1-9][0-9]?),(0|[1-9][0-9]?)$' or jsonb_typeof(c) <> 'object' then raise exception 'Invalid cell: %',k; end if;

  x:=split_part(k,',',1)::integer; y:=split_part(k,',',2)::integer;

  if x>=nx or y>=nr then raise exception 'Cell outside layout: %',k; end if;

  t:=c->>'type'; if t is null or t not in ('void','roundTable','longTable','stairs','doubleDoor','desk','wall','door','meeting','plant','aisle','coffee','water','printer','fridge','cabinet','sofa','plants','books','window') then raise exception 'Invalid object type'; end if;

  if coalesce(c->>'rotation','') not in ('0','90','180','270') then raise exception 'Invalid rotation'; end if;

  r:=(c->>'rotation')::integer;

  if t='desk' then

   d:=c->>'id'; if d is null or d !~ '^D-[0-9]{1,8}$' or d=any(seen) then raise exception 'Invalid or duplicate desk ID'; end if;

   seen:=array_append(seen,d); biggest:=greatest(biggest,substring(d from 3)::integer);

   lab:=left(coalesce(nullif(c->>'label',''),d),40);

   outcells:=outcells||jsonb_build_object(k,jsonb_build_object('type',t,'rotation',r,'id',d,'label',lab,'name','','status','offline'));

  else outcells:=outcells||jsonb_build_object(k,jsonb_build_object('type',t,'rotation',r)); end if;

  if t in ('roundTable','longTable','stairs','doubleDoor') then
 if coalesce(c->>'part','') !~ '^[0-5]$' then raise exception 'Invalid object part';end if;
 outcells:=jsonb_set(outcells,array[k,'part'],to_jsonb((c->>'part')::int),true);
end if;
if t='void' and r<>0 then raise exception 'Invalid cutout rotation';end if;
if t in ('desk','coffee','water','printer','fridge','cabinet','sofa','plants','books') and c ? 'align' then

   v_alignment:=c->>'align';

   if v_alignment is null or v_alignment not in ('wall','center') then raise exception 'Invalid wall alignment';end if;

   outcells:=jsonb_set(outcells,array[k,'align'],to_jsonb(v_alignment),true);

  end if;

 end loop;

 if p ? 'edges' then

  if jsonb_typeof(p->'edges') is distinct from 'object' then raise exception 'Invalid edge fixtures';end if;

  for v_edge_key,v_edge in select key,value from jsonb_each(p->'edges') loop

   if v_edge_key !~ '^[NSEW]:(0|[1-9][0-9]?)$' or jsonb_typeof(v_edge) is distinct from 'object' or v_edge->>'type' is distinct from 'window' then raise exception 'Invalid window edge: %',v_edge_key;end if;

   v_edge_index:=split_part(v_edge_key,':',2)::int;

   if (left(v_edge_key,1) in ('N','S') and v_edge_index>=nx) or (left(v_edge_key,1) in ('E','W') and v_edge_index>=nr) then raise exception 'Window outside perimeter: %',v_edge_key;end if;

   v_edges:=v_edges||jsonb_build_object(v_edge_key,jsonb_build_object('type','window'));

  end loop;

 end if;

 n:=biggest+1;

 if coalesce(p->>'nextId','') ~ '^[0-9]{1,8}$' then n:=greatest(n,(p->>'nextId')::integer); end if;

 if n>=100000000 then raise exception 'Desk ID limit exceeded'; end if;

 perform oc41_private.oc667_validate(jsonb_build_object('cols',nx,'rows',nr,'cells',outcells));
return jsonb_build_object('version',1,'cols',nx,'rows',nr,'nextId',n,'cells',outcells,'edges',v_edges);

end $function$;
CREATE OR REPLACE FUNCTION oc41_private.oc51_cell_type(p jsonb, k text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$

 select case when p->'cells'->k->>'type'='doubleDoor' then 'door'

 when p->>'cols'='10' and p->>'rows'='19'

  and p->'cells'->'0,4'->>'id'='D-077' and p->'cells'->'8,4'->>'id'='D-082'

  and (

   (k in ('0,4','1,4','8,4','9,4') and p->'cells'->k->>'id' in ('D-077','D-148','D-082','D-083') and p->'cells'->k->>'rotation'='0' and p->'cells'->(split_part(k,',',1)||',3')->>'type'='wall')

   or (k in ('3,4','6,4') and p->'cells'->k->>'type'='plant')

  ) then 'aisle'

 when p->>'cols'='10' and p->>'rows'='19' and p->'cells'->'6,0'->>'type'='wall' and p->'cells'->'6,1'->>'type'='wall' and p->'cells'->'6,2'->>'type'='wall'

  and p->'cells'->'6,3'->>'type'='door' and p->'cells'->'7,3'->>'type'='wall'

  and (k='6,2' or (k in ('7,0','7,1') and p->'cells'->k->>'id' in ('D-074','D-093') and p->'cells'->k->>'rotation' in ('0','180'))) then 'aisle'

 when p->'cells'->k->>'type' in ('desk','coffee','water','printer','fridge','cabinet','sofa','plants','books') and k ~ '^[0-9]{1,2},[0-9]{1,2}$' then

  case when abs((oc41_private.oc612_offset(p,split_part(k,',',1)::int,split_part(k,',',2)::int,p->'cells'->k))[1])+abs((oc41_private.oc612_offset(p,split_part(k,',',1)::int,split_part(k,',',2)::int,p->'cells'->k))[2])>1.4

   then case when oc41_private.oc611_clear(p,split_part(k,',',1)::int,split_part(k,',',2)::int) then 'aisle' else p->'cells'->k->>'type' end

   else p->'cells'->k->>'type' end

 else coalesce(p->'cells'->k->>'type','aisle') end;

$function$;
CREATE OR REPLACE FUNCTION oc41_private.oc51_path(p jsonb, p_start text, p_goal text, p_anchor boolean DEFAULT false)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$

declare w int:=(p->>'cols')::int; h int:=(p->>'rows')::int; n int:=w*h;

 sx int; sy int; gx int; gy int; start_id int; goal_id int; cur int; nx int; ny int; ni int;

 head int:=1; tail int:=1; q int[]; parent int[]; x int; y int; j int; k text; typ text; current_type text; horizontal boolean; result text[]:=array[]::text[];

 dx int[]:=array[0,-1,1,0]; dy int[]:=array[1,0,0,-1];

begin

 if p_start is null or p_start !~ '^(0|[1-9][0-9]?),(0|[1-9][0-9]?)$' or n not between 1 and 4000 then return null; end if;

 sx:=split_part(p_start,',',1)::int; sy:=split_part(p_start,',',2)::int;

 if sx>=w or sy>=h then return null; end if;

 start_id:=sy*w+sx+1;

 if not p_anchor then

  if p_goal is null or p_goal !~ '^(0|[1-9][0-9]?),(0|[1-9][0-9]?)$' then return null; end if;

  gx:=split_part(p_goal,',',1)::int; gy:=split_part(p_goal,',',2)::int;

  if gx>=w or gy>=h or oc41_private.oc51_cell_type(p,p_goal)<>'aisle'

   or oc41_private.oc51_cell_type(p,p_start)<>'aisle' then return null; end if;

  goal_id:=gy*w+gx+1;

 end if;

 q:=array_fill(0,array[n]);parent:=array_fill(0,array[n]);q[1]:=start_id;parent[start_id]:=-1;

 while head<=tail loop

  cur:=q[head];head:=head+1;x:=(cur-1)%w;y:=(cur-1)/w;k:=x::text||','||y::text;

  if p_anchor and oc41_private.oc51_cell_type(p,k)='aisle' then

   -- Skip isolated floor pockets between furniture; select an actual walking lane.

   for j in 1..4 loop

    nx:=x+dx[j];ny:=y+dy[j];

    if nx>=0 and ny>=0 and nx<w and ny<h and oc41_private.oc51_cell_type(p,nx::text||','||ny::text)='aisle' then return array[k];end if;

   end loop;

  end if;

  if not p_anchor and cur=goal_id then

   while cur<>-1 loop

    result:=array_prepend(((cur-1)%w)::text||','||((cur-1)/w)::text,result);cur:=parent[cur];

   end loop;

   return result;

  end if;

  for j in 1..4 loop

   nx:=x+dx[j];ny:=y+dy[j];

   if nx<0 or ny<0 or nx>=w or ny>=h then continue; end if;

   ni:=ny*w+nx+1;if parent[ni]<>0 then continue; end if;

   if p->'cells'->'6,2'->>'type'='wall' and oc41_private.oc51_cell_type(p,'6,2')='aisle' and ((x=6 and y=2 and (nx<6 or ny<2)) or (nx=6 and ny=2 and (x<6 or y<2))) then continue;end if;

   typ:=oc41_private.oc51_cell_type(p,nx::text||','||ny::text);

   current_type:=oc41_private.oc51_cell_type(p,k);

   if (p_anchor and typ in ('wall','door','void','roundTable','longTable','stairs')) or (not p_anchor and typ not in ('aisle','door')) then continue; end if;

   -- Door cells may only be crossed perpendicular to their wall; no sideways entry.

   if not p_anchor and typ='door' then

    horizontal:=case when p->'cells'->(nx::text||','||ny::text)->>'type'='doubleDoor' then ((p->'cells'->(nx::text||','||ny::text)->>'rotation')::int%180=0) else coalesce(p->'cells'->((nx-1)::text||','||ny::text)->>'type','') in ('wall','door') or coalesce(p->'cells'->((nx+1)::text||','||ny::text)->>'type','') in ('wall','door','doubleDoor') end;

    if (horizontal and nx<>x) or (not horizontal and ny<>y) then continue; end if;

   end if;

   if not p_anchor and current_type='door' then

    horizontal:=case when p->'cells'->k->>'type'='doubleDoor' then ((p->'cells'->k->>'rotation')::int%180=0) else coalesce(p->'cells'->((x-1)::text||','||y::text)->>'type','') in ('wall','door') or coalesce(p->'cells'->((x+1)::text||','||y::text)->>'type','') in ('wall','door','doubleDoor') end;

    if (horizontal and nx<>x) or (not horizontal and ny<>y) then continue; end if;

   end if;

   tail:=tail+1;q[tail]:=ni;parent[ni]:=cur;

  end loop;

 end loop;

 return null;

end $function$;
CREATE OR REPLACE FUNCTION oc41_private.oc50_path(p jsonb, p_start text, p_goal text, p_anchor boolean DEFAULT false)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$

declare w int:=(p->>'cols')::int; h int:=(p->>'rows')::int; n int:=w*h;

 sx int; sy int; gx int; gy int; start_id int; goal_id int; cur int; nx int; ny int; ni int;

 head int:=1; tail int:=1; q int[]; parent int[]; x int; y int; j int; k text; typ text; result text[]:=array[]::text[];

 dx int[]:=array[0,-1,1,0]; dy int[]:=array[1,0,0,-1];

begin

 if p_start is null or p_start !~ '^(0|[1-9][0-9]?),(0|[1-9][0-9]?)$' or n not between 1 and 4000 then return null; end if;

 sx:=split_part(p_start,',',1)::int; sy:=split_part(p_start,',',2)::int;

 if sx>=w or sy>=h then return null; end if;

 start_id:=sy*w+sx+1;

 if not p_anchor then

  if p_goal is null or p_goal !~ '^(0|[1-9][0-9]?),(0|[1-9][0-9]?)$' then return null; end if;

  gx:=split_part(p_goal,',',1)::int; gy:=split_part(p_goal,',',2)::int;

  if gx>=w or gy>=h or coalesce(p->'cells'->p_goal->>'type','aisle')<>'aisle'

   or coalesce(p->'cells'->p_start->>'type','aisle')<>'aisle' then return null; end if;

  goal_id:=gy*w+gx+1;

 end if;

 q:=array_fill(0,array[n]);parent:=array_fill(0,array[n]);q[1]:=start_id;parent[start_id]:=-1;

 while head<=tail loop

  cur:=q[head];head:=head+1;x:=(cur-1)%w;y:=(cur-1)/w;k:=x::text||','||y::text;

  if p_anchor and coalesce(p->'cells'->k->>'type','aisle')='aisle' then

   -- Skip isolated floor pockets between furniture; select an actual walking lane.

   for j in 1..4 loop

    nx:=x+dx[j];ny:=y+dy[j];

    if nx>=0 and ny>=0 and nx<w and ny<h and coalesce(p->'cells'->(nx::text||','||ny::text)->>'type','aisle')='aisle' then return array[k];end if;

   end loop;

  end if;

  if not p_anchor and cur=goal_id then

   while cur<>-1 loop

    result:=array_prepend(((cur-1)%w)::text||','||((cur-1)/w)::text,result);cur:=parent[cur];

   end loop;

   return result;

  end if;

  for j in 1..4 loop

   nx:=x+dx[j];ny:=y+dy[j];

   if nx<0 or ny<0 or nx>=w or ny>=h then continue; end if;

   ni:=ny*w+nx+1;if parent[ni]<>0 then continue; end if;

   typ:=coalesce(p->'cells'->(nx::text||','||ny::text)->>'type','aisle');

   if (p_anchor and typ in ('wall','door','void','roundTable','longTable','stairs','doubleDoor')) or (not p_anchor and typ<>'aisle') then continue; end if;

   tail:=tail+1;q[tail]:=ni;parent[ni]:=cur;

  end loop;

 end loop;

 return null;

end $function$;
CREATE OR REPLACE FUNCTION oc41_private.oc611_clear(p jsonb, p_x double precision, p_y double precision)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$

declare v_cell record; v_x double precision; v_y double precision; v_rot double precision; v_type text; v_id text; v_exec boolean; v_horizontal boolean; v_side double precision; v_door_open double precision:=0.84; v_offset double precision[]; v_r int; v_dx float8; v_dy float8;

begin

 if p_x is null or p_y is null or not (p_x between -0.35 and (p->>'cols')::int-0.65 and p_y between -0.35 and (p->>'rows')::int-0.65) then return false;end if;

 for v_cell in select key,value from jsonb_each(p->'cells') loop

  v_x:=split_part(v_cell.key,',',1)::int;v_y:=split_part(v_cell.key,',',2)::int;

  if abs(v_x-p_x)>2.1 or abs(v_y-p_y)>2.1 then continue;end if;

  v_type:=v_cell.value->>'type';v_id:=v_cell.value->>'id';v_rot:=-coalesce((v_cell.value->>'rotation')::int,0)*pi()/180;

  if v_type in ('void','roundTable','longTable','stairs') or (v_type='wall' and oc41_private.oc667_legacy_stair(p,v_x::int,v_y::int)) then
 if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,0,0,0,1.82,1.82) then return false;end if;
elsif v_type='doubleDoor' then
 if v_cell.value->>'part'='0' then
  v_r:=(v_cell.value->>'rotation')::int;
  if v_r%180=0 then v_x:=v_x+.5;v_y:=v_y+case when v_r=180 then .5 else -.5 end;v_dx:=1-.065/1.82;v_dy:=0;
  else v_x:=v_x+case when v_r=90 then .5 else -.5 end;v_y:=v_y+.5;v_dx:=0;v_dy:=1-.065/1.82;end if;
  if not oc41_private.oc611_rect_clear(p_x,p_y,v_x-v_dx,v_y-v_dy,v_rot,0,0,.13,.20)
   or not oc41_private.oc611_rect_clear(p_x,p_y,v_x+v_dx,v_y+v_dy,v_rot,0,0,.13,.20) then return false;end if;
 end if;
elsif v_type='desk' then

   v_exec:=v_id in ('D-063','D-073');

   v_offset:=oc41_private.oc612_offset(p,v_x::int,v_y::int,v_cell.value);v_x:=v_x+v_offset[1]/1.82;v_y:=v_y+v_offset[2]/1.82;

   if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,case when v_exec then -0.23 else -0.21 end,case when v_exec then 1.75 else 1.63 end,case when v_exec then 1.32 else 0.90 end)

    or not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,case when v_exec then 0.60 else 0.54 end,case when v_exec then 0.82 else 0.68 end,case when v_exec then 0.77 else 0.65 end) then return false;end if;

  elsif v_type='plant' then

   if p->>'cols'='10' and p->>'rows'='19' and v_y=4 and v_x in (3,6) and p->'cells'->'0,4'->>'id'='D-077' and p->'cells'->'8,4'->>'id'='D-082' then

    if p->'cells'->(v_x::int::text||',3')->>'type'='door' then v_x:=v_x+0.88/1.82;end if;v_y:=v_y-1.74/1.82;

   end if;

   if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,0,0,0,0.83,0.83) then return false;end if;

  elsif v_type='meeting' then

   if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,0,1.50,0.85)

    or not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,-0.66,0.48,0.46)

    or not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,0.66,0.48,0.46) then return false;end if;

  elsif v_type in ('wall','door') then

   v_horizontal:=coalesce(p->'cells'->((v_x::int-1)::text||','||v_y::int::text)->>'type','') in ('wall','door') or coalesce(p->'cells'->((v_x::int+1)::text||','||v_y::int::text)->>'type','') in ('wall','door','doubleDoor');

   v_rot:=case when v_horizontal then 0 else pi()/2 end;

   if v_type='wall' then

    if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,-0.78,1.82,0.20) then return false;end if;

   else

    v_side:=(1.82-v_door_open)/2;

    if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,-(v_door_open+v_side)/2,-0.78,v_side,0.20)

     or not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,(v_door_open+v_side)/2,-0.78,v_side,0.20) then return false;end if;

   end if;

  elsif v_type in ('coffee','water','printer','fridge','cabinet','sofa','plants','books','window') then

   v_offset:=oc41_private.oc612_offset(p,v_x::int,v_y::int,v_cell.value);v_x:=v_x+v_offset[1]/1.82;v_y:=v_y+v_offset[2]/1.82;

   if not oc41_private.oc611_rect_clear(p_x,p_y,v_x,v_y,v_rot,0,case when v_type='water' then 0.035 else 0 end,case when v_type='water' then 0.65 else 1.66 end,case when v_type='water' then 0.65 when v_type='window' then 0.20 else 1.08 end) then return false;end if;

  end if;

 end loop;

 return true;

end $function$;
CREATE OR REPLACE FUNCTION public.oc41_snapshot()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare me oc41_private.profiles%rowtype; l oc41_private.layout%rowtype; occupants jsonb; staff jsonb := '[]'::jsonb;

begin

 select * into me from oc41_private.profiles where user_id=auth.uid();

 select * into l from oc41_private.layout where id=1;

 select coalesce(jsonb_agg(jsonb_build_object('desk_id',p.desk_id,'nickname',case when me.enabled then p.nickname else null end) order by p.desk_id),'[]'::jsonb)

 into occupants from oc41_private.profiles p where p.enabled and p.desk_id is not null;

 if me.enabled and me.role='admin' then

  select coalesce(jsonb_agg(jsonb_build_object('user_id',p.user_id,'employee_no',p.employee_no,'nickname',p.nickname,'role',p.role,'enabled',p.enabled,'desk_id',p.desk_id) order by p.employee_no),'[]'::jsonb) into staff from oc41_private.profiles p;

 end if;

 return jsonb_build_object('floor_shapes_version',1,'plan',l.plan,'revision',l.revision,'updated_at',l.updated_at,'occupants',occupants,'staff',staff,

 'me',case when me.user_id is null then null else jsonb_build_object('user_id',me.user_id,'employee_no',me.employee_no,'nickname',me.nickname,'role',me.role,'enabled',me.enabled,'desk_id',me.desk_id) end);

end $function$;

do $test$
declare p jsonb; q jsonb; saved jsonb; t text; r int; w int; h int; i int; expected int; failed boolean; route text[];
begin
 select plan into saved from oc41_private.layout where id=1;
 perform oc41_private.clean_plan(saved);
 p:='{"version":1,"cols":8,"rows":8,"nextId":1,"cells":{},"edges":{}}'::jsonb;
 for t in select unnest(array['roundTable','longTable','stairs','doubleDoor']) loop
  foreach r in array array[0,90,180,270] loop
   if t='roundTable' and r<>0 then continue;end if;
   q:=p;w:=case when t='stairs' then 3 else 2 end;h:=case when t in ('stairs','roundTable') then 2 else 1 end;
   if r%180<>0 then i:=w;w:=h;h:=i;end if;
   for i in 0..w*h-1 loop q:=jsonb_set(q,array['cells',(2+i%w)::text||','||(2+i/w)::text],jsonb_build_object('type',t,'rotation',r,'part',i),true);end loop;
   if oc41_private.clean_plan(q)->'cells'<>q->'cells' then raise exception 'Round-trip failed: % %',t,r;end if;
   failed:=false;begin perform oc41_private.clean_plan(q#-array['cells','2,2']);exception when others then failed:=true;end;if not failed then raise exception 'Partial footprint accepted';end if;
   if t<>'doubleDoor' and oc41_private.oc611_clear(q,2,2) then raise exception 'Furniture collision missing';end if;
   if t='doubleDoor' then
    if oc41_private.oc51_cell_type(q,'2,2')<>'door' then raise exception 'Door path type missing';end if;
    if r%180=0 then route:=oc41_private.oc51_path(q,'2,1','2,3');else route:=oc41_private.oc51_path(q,'1,2','3,2');end if;
    if route is null then raise exception 'Double-door crossing failed: %',r;end if;
   end if;
  end loop;
 end loop;
 q:=jsonb_set(p,array['cells','2,2'],'{"type":"void","rotation":0}'::jsonb);
 if oc41_private.clean_plan(q)->'cells'<>q->'cells' or oc41_private.oc611_clear(q,2,2) or oc41_private.oc611_segment_clear(q,1,2,3,2) then raise exception 'Cut floor collision failed';end if;
 for i in 0..7 loop q:=jsonb_set(q,array['cells','2,'||i::text],'{"type":"void","rotation":0}'::jsonb,true);end loop;
 if oc41_private.oc51_path(q,'1,2','3,2') is not null then raise exception 'Route crossed removed floor';end if;
 q:=p;for i in 0..63 loop q:=jsonb_set(q,array['cells',(i%8)::text||','||(i/8)::text],'{"type":"void","rotation":0}'::jsonb,true);end loop;
 failed:=false;begin perform oc41_private.clean_plan(q);exception when others then failed:=true;end;if not failed then raise exception 'Empty footprint accepted';end if;
 if not exists(select 1 from oc41_private.layout where id=1 and plan=saved) then raise exception 'Saved plan changed during verification';end if;
end $test$;
do $rpc_test$
declare before_row oc41_private.layout%rowtype; uid uuid; prev_sub text; q jsonb; original_cols int; r int; c int; part int; spec record; denied boolean; old_count int;
begin
 select * into before_row from oc41_private.layout where id=1;
 select user_id into uid from oc41_private.profiles where enabled and role='admin' limit 1;
 if uid is null then raise exception 'Admin test account unavailable';end if;
 prev_sub:=current_setting('request.jwt.claim.sub',true);
 begin
  perform set_config('request.jwt.claim.sub',uid::text,true);
  original_cols:=(before_row.plan->>'cols')::int;
  if original_cols>76 then raise exception 'Test needs four temporary columns';end if;
  q:=jsonb_set(before_row.plan,'{cols}',to_jsonb(original_cols+4));
  q:=jsonb_set(q,'{rows}',to_jsonb(greatest(12,(q->>'rows')::int)));
  for spec in select * from (values ('roundTable',0,2,2),('longTable',3,2,1),('stairs',5,3,2),('doubleDoor',8,2,1)) v(t,y,w,h) loop
   for part in 0..spec.w*spec.h-1 loop
    q:=jsonb_set(q,array['cells',(original_cols+part%spec.w)::text||','||(spec.y+part/spec.w)::text],jsonb_build_object('type',spec.t,'rotation',0,'part',part),true);
   end loop;
  end loop;
  q:=jsonb_set(q,array['cells',(original_cols+3)::text||',10'],'{"type":"void","rotation":0}'::jsonb,true);
  perform public.oc41_save_layout(q,before_row.revision);
  if not exists(select 1 from oc41_private.layout where id=1 and revision=before_row.revision+1 and plan=oc41_private.clean_plan(q)) then raise exception 'Actual save RPC round-trip failed';end if;
  denied:=false;begin perform public.oc41_save_layout(q,before_row.revision);exception when serialization_failure then denied:=true;end;if not denied then raise exception 'Revision guard failed';end if;
  perform set_config('request.jwt.claim.sub','',true);
  denied:=false;begin perform public.oc41_save_layout(q,before_row.revision+1);exception when insufficient_privilege then denied:=true;end;if not denied then raise exception 'Admin guard failed';end if;
  raise exception 'Rollback RPC test data' using errcode='ZX001';
 exception when sqlstate 'ZX001' then null;
 end;
 perform set_config('request.jwt.claim.sub',coalesce(prev_sub,''),true);
 if not exists(select 1 from oc41_private.layout where id=1 and revision=before_row.revision and plan=before_row.plan) then raise exception 'RPC test data was not rolled back';end if;
end $rpc_test$;
select 'FLOOR SHAPES CHECK PASSED' as result;
rollback;
