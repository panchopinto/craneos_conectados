
document.addEventListener('DOMContentLoaded', async ()=>{
  const mv=document.getElementById('mv');
  const src=new URLSearchParams(location.search).get('src')||'';
  const base=src.split('/').pop().replace('.glb','');
  try{
    const r=await fetch('assets/hotspots/'+base+'.json');
    if(r.ok){
      const data=await r.json();
      data.forEach((h,i)=>{
        const b=document.createElement('button'); b.className='btn';
        b.setAttribute('slot','hotspot-'+i); b.setAttribute('data-position',h.position);
        b.setAttribute('data-normal',h.normal); b.textContent='📍 '+h.name; mv.appendChild(b);
      });
    }
  }catch(e){}
});
