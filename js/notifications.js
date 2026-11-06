function notificationStorageKey(){return `prestamo_notifications_deleted_${state.user?.id||'guest'}`}
function getDeletedNotifications(){try{return new Set(JSON.parse(localStorage.getItem(notificationStorageKey())||'[]'))}catch{return new Set()}}
function saveDeletedNotifications(ids){localStorage.setItem(notificationStorageKey(),JSON.stringify([...ids]))}
async function collectNotifications(){
 const items=[],admin=state.user.rol==='admin';
 try{
  if(admin){
   const {requests=[]}=await api('/requests');
   requests.filter(x=>String(x.estado).toLowerCase()==='pendiente').forEach(x=>items.push({id:`request-${x.id}`,type:'Solicitud pendiente',title:`Solicitud #${x.id} por revisar`,body:`${x.cliente_nombre||x.cliente_usuario||'Un cliente'} solicita ${money(x.monto)} a ${x.meses} meses.`,date:x.fecha_solicitud||'',page:'requests',action:'Ver solicitud'}));
   const {audit=[]}=await api('/audit');
   audit.slice(0,12).forEach(x=>items.push({id:`audit-${x.id||x.fecha+'-'+x.accion+'-'+x.usuario}`,type:'Actividad reciente',title: x.accion||'Actividad del sistema',body:`${x.usuario||'Usuario'} · ${x.detalle||'Se registró una actividad.'}`,date:x.fecha||'',page:'audit',action:'Ver actividad'}));
  }else{
   const {requests=[]}=await api('/requests');
   requests.forEach(x=>{const status=String(x.estado||'').toLowerCase();if(['aprobada','rechazada'].includes(status))items.push({id:`request-${x.id}-${status}`,type:'Actualización de solicitud',title:`Tu solicitud #${x.id} fue ${status}`,body:status==='aprobada'?'Tu préstamo fue aprobado. Consulta tus préstamos para ver el cronograma.':`Tu solicitud fue rechazada.${x.nota_admin?' Motivo: '+x.nota_admin:''}`,date:x.fecha_solicitud||'',page:'myrequests',action:'Ver solicitudes'});});
   const {loans=[]}=await api('/loans');
   for(const loan of loans.filter(x=>String(x.estado).toLowerCase()==='activo')){try{const d=await api(`/loans/${loan.id}`);for(const q of (d.quotas||[])){if(['pagada','liquidada'].includes(String(q.estado||'').toLowerCase()))continue;const due=new Date(String(q.fecha||'').slice(0,10)+'T23:59:59');if(!Number.isNaN(due.getTime())){const days=Math.ceil((due-Date.now())/86400000);if(days<0||days<=7)items.push({id:`quota-${q.id}-${q.fecha}`,type:days<0?'Cuota vencida':'Próximo vencimiento',title:days<0?`Cuota vencida · Préstamo #${loan.id}`:`Cuota próxima · Préstamo #${loan.id}`,body:`Cuota ${q.mes||''} · Fecha ${fmtDate(q.fecha)} · Pendiente ${money(Math.max(0,Number(q.cuota||0)-Number(q.abonado||0)))}`,date:q.fecha,page:'loans',action:'Ver préstamo'});}}}catch{}}
  }
 }catch(e){console.warn('No fue posible reunir todas las notificaciones',e)}
 return items.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
async function renderNotifications(){
 const c=$('#pageContent');c.innerHTML='<div class="empty">Cargando notificaciones…</div>';
 const all=await collectNotifications(),deleted=getDeletedNotifications(),items=all.filter(n=>!deleted.has(n.id));
 c.innerHTML=`<div class="section-title"><div><h2>Centro de notificaciones</h2><p>${items.length?`${items.length} notificación(es) activas para tu cuenta.`:'No tienes notificaciones nuevas.'} Puedes quitar notificaciones de tu cuenta cuando quieras.</p></div><div class="table-actions"><button class="btn danger" data-action="delete-all-notifications" ${items.length?'':'disabled'}>Eliminar todas</button><button class="btn secondary" data-action="refresh-notifications">Actualizar</button></div></div><section class="panel"><div class="notification-list">${items.length?items.map(n=>`<article class="notification-item"><div class="notification-symbol">${n.type.includes('vencida')?'!':n.type.includes('Solicitud')?'⇄':n.type.includes('Actividad')?'◷':'♧'}</div><div class="notification-copy"><div class="notification-meta"><span>${esc(n.type)}</span><time>${esc(n.date?fmtDate(n.date):'Reciente')}</time></div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><button class="btn ghost" data-page="${esc(n.page)}">${esc(n.action)}</button></div><button class="btn danger notification-delete" data-action="delete-notification" data-id="${esc(n.id)}" title="Eliminar notificación">Eliminar</button></article>`).join(''):`<div class="empty"><div class="empty-icon">♧</div><b>Todo al día</b>Cuando haya solicitudes pendientes, actividad reciente o vencimientos cercanos, aparecerán aquí.</div>`}</div></section>`;
}
