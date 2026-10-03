import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class BackendConsoleController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  getConsole(): string {
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>UMSSPIRA | Consola API</title>
  <style>
    :root{color-scheme:light;--ink:#172327;--muted:#637275;--line:#d4dedb;--paper:#f3f6f1;--panel:#fff;--green:#126b53;--lime:#d4e76b;--red:#a83232;--blue:#1c5263;font-family:ui-monospace,"Cascadia Code",Consolas,monospace}
    *{box-sizing:border-box}body{margin:0;background:linear-gradient(120deg,transparent 70%,#d9e6d9 70%),var(--paper);color:var(--ink);min-height:100vh}
    header{padding:24px clamp(20px,5vw,72px);background:var(--ink);color:#f4f7ed;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:5px solid var(--lime)}
    .brand{font:700 19px Georgia,serif;letter-spacing:0}.brand span{color:var(--lime)}.status{font-size:12px;color:#d2e1d8}.status b{color:var(--lime)}
    main{max-width:1050px;margin:38px auto;padding:0 22px}.intro{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}h1{font:700 clamp(27px,4vw,42px) Georgia,serif;letter-spacing:0;margin:0 0 8px}.intro p{color:var(--muted);margin:0;font:14px/1.6 system-ui,sans-serif}.port{font-size:12px;color:var(--green);white-space:nowrap}
    .workspace{display:grid;grid-template-columns:270px 1fr;gap:22px;align-items:start}.rail,.editor{background:var(--panel);border:1px solid var(--line)}.rail{padding:18px}.editor{padding:20px}.label{display:block;font:700 11px system-ui,sans-serif;letter-spacing:0;color:var(--muted);text-transform:uppercase;margin:0 0 9px}select,textarea{width:100%;border:1px solid var(--line);background:#fbfcf9;color:var(--ink);font:13px/1.6 ui-monospace,"Cascadia Code",Consolas,monospace;border-radius:2px}select{padding:11px;margin-bottom:12px}textarea{min-height:365px;padding:14px;resize:vertical;tab-size:2}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}button{border:0;border-radius:2px;padding:11px 14px;background:var(--green);color:white;font:700 12px system-ui,sans-serif;cursor:pointer}button.secondary{background:var(--blue)}button.danger{background:var(--red)}button:hover{filter:brightness(1.12)}button:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid var(--lime);outline-offset:2px}.note{font:12px/1.6 system-ui,sans-serif;color:var(--muted);margin:18px 0 0}.output{margin-top:20px;border-top:1px solid var(--line);padding-top:17px}.output pre{white-space:pre-wrap;word-break:break-word;font:12px/1.65 ui-monospace,"Cascadia Code",Consolas,monospace;margin:0;color:var(--ink)}
    @media(max-width:700px){header{align-items:flex-start;flex-direction:column}main{margin:25px auto}.intro{align-items:flex-start;flex-direction:column}.workspace{grid-template-columns:1fr}.rail{padding:14px}.editor{padding:14px}textarea{min-height:300px}}
  </style>
</head>
<body>
  <header><div class="brand">UMSSPIRA <span>/ API LAB</span></div><div class="status" id="status">Conectando con el API...</div></header>
  <main>
    <section class="intro"><div><h1>Mentorship test bench</h1><p>Perfiles de prueba, elegibilidad y desactivacion conectados al API local.</p></div><div class="port">API · localhost:3000</div></section>
    <section class="workspace">
      <aside class="rail"><label class="label" for="profile">Perfil de prueba</label><select id="profile"><option>Cargando perfiles...</option></select><button class="secondary" id="reload" type="button">Actualizar perfiles</button><button class="secondary" id="reset" type="button" hidden>Restablecer datos demo</button><p class="note">Incluye un mentor elegible, un perfil incompleto y un perfil con restricciones.</p></aside>
      <section class="editor"><label class="label" for="payload">Perfil enviado a la API</label><textarea id="payload" spellcheck="false" aria-label="JSON del perfil de mentor"></textarea><div class="actions"><button id="evaluate" type="button">Evaluar elegibilidad</button><button class="danger" id="deactivate" type="button">Desactivar mentor</button></div><div class="output"><span class="label">Respuesta</span><pre id="result">Selecciona un perfil para comenzar.</pre></div></section>
    </section>
  </main>
  <script>
    const picker=document.querySelector('#profile'),payload=document.querySelector('#payload'),result=document.querySelector('#result'),status=document.querySelector('#status'),reset=document.querySelector('#reset');let profiles=[];
    async function request(path,options){const response=await fetch(path,{headers:{'Content-Type':'application/json'},...options});const data=await response.json().catch(()=>({message:response.statusText}));if(!response.ok)throw new Error(data.message||'Error '+response.status);return data}
    function selected(){return JSON.parse(payload.value)}
    function show(value){result.textContent=JSON.stringify(value,null,2)}
    async function load(){try{const state=await request('/mentorship/status');status.innerHTML='Modo <b>'+state.mode.toUpperCase()+'</b> · '+(state.mode==='supabase'?'persistencia Supabase':'perfiles locales de demostracion');reset.hidden=state.mode!=='demo';profiles=await request('/mentorship/test-profiles');picker.replaceChildren(...profiles.map((profile,index)=>{const option=document.createElement('option');option.value=profile.userId;option.textContent=(index+1)+'. '+profile.personalInfo.firstName+' '+profile.personalInfo.lastName+' · '+(profile.isMentorActive?'activo':'inactivo');return option}));picker.dispatchEvent(new Event('change'));}catch(error){status.textContent='API no disponible';show({error:error.message})}}
    picker.addEventListener('change',()=>{const profile=profiles.find(item=>item.userId===picker.value);if(profile)payload.value=JSON.stringify(profile,null,2)});
    document.querySelector('#reload').addEventListener('click',load);
    reset.addEventListener('click',async()=>{if(!confirm('Restablecer los perfiles demo y su estado inicial?'))return;try{await request('/mentorship/test-profiles/reset',{method:'POST'});show({message:'Perfiles demo restablecidos.'});await load()}catch(error){show({error:error.message})}});
    document.querySelector('#evaluate').addEventListener('click',async()=>{try{show(await request('/mentorship/eligibility',{method:'POST',body:JSON.stringify({profile:selected()})}))}catch(error){show({error:error.message})}});
    document.querySelector('#deactivate').addEventListener('click',async()=>{try{const profile=selected();if(!confirm('Desactivar el rol de mentor de '+profile.personalInfo.firstName+'?'))return;const response=await request('/mentorship/deactivate/'+encodeURIComponent(profile.userId),{method:'PATCH',body:JSON.stringify({reason:'Prueba desde la consola backend'})});show(response);await load()}catch(error){show({error:error.message})}});
    load();
  </script>
</body>
</html>`;
  }
}