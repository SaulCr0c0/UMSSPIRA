'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CalendarDays, Check, Clock3, Eye, MessageSquareText, X } from 'lucide-react';

type Status = 'Pendiente' | 'Aceptada' | 'Rechazada';
type RequestItem = { id: number; name: string; role: string; date: string; time: string; motive: string; status: Status };

const initialRequests: RequestItem[] = [
  { id: 1, name: 'María Fernanda Rojas', role: 'Estudiante de Ingeniería Industrial', date: '22/10/2026', time: '10:00', motive: 'Quisiera orientación para preparar mi primera experiencia laboral en el área de gestión de proyectos.', status: 'Pendiente' },
  { id: 2, name: 'Diego Andrés Molina', role: 'Egresado de Ingeniería de Sistemas', date: '24/10/2026', time: '15:30', motive: 'Me interesa conocer cómo fue tu experiencia al iniciar una carrera en desarrollo de software.', status: 'Pendiente' },
  { id: 3, name: 'Paola Jimena Vargas', role: 'Estudiante de Ingeniería Comercial', date: '20/10/2026', time: '09:00', motive: 'Busco consejos para fortalecer mi perfil profesional y prepararme para entrevistas.', status: 'Aceptada' },
];

export function MentorshipRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [detail, setDetail] = useState<RequestItem | null>(null);
  const [confirm, setConfirm] = useState<{ item: RequestItem; action: 'accept' | 'reject' } | null>(null);
  const [notice, setNotice] = useState('');
  const pendingCount = requests.filter(item => item.status === 'Pendiente').length;

  const perform = () => {
    if (!confirm) return;
    const { item, action } = confirm;
    const status: Status = action === 'accept' ? 'Aceptada' : 'Rechazada';
    setRequests(items => items.map(current => current.id === item.id ? { ...current, status } : current));
    setNotice(action === 'accept' ? `Aceptaste la solicitud de ${item.name}.` : `Rechazaste la solicitud de ${item.name}.`);
    setConfirm(null);
  };

  return <main className="mentorship-shell requests-page">
    <nav aria-label="Ruta de navegación" className="requests-crumb"><Link href="/">Inicio</Link><span>/</span><Link href="/mentorship">Mentorías</Link><span>/</span><span>Mis solicitudes</span><span>/</span><span aria-current="page">Solicitudes recibidas</span></nav>
    <header className="requests-heading"><p className="requests-eyebrow">RED UNIVERSITARIA DE DESARROLLO</p><h1>Solicitudes recibidas</h1><p>Revisa las solicitudes de mentoría que recibiste y gestiona tu respuesta.</p></header>
    {notice && <p className="requests-notice" role="status">{notice}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={16}/></button></p>}
    <section className="requests-panel" aria-label="Solicitudes recibidas">
      <div className="requests-panel-title"><div><h2>Bandeja de solicitudes</h2><p>Abre el detalle para conocer el motivo y responder a cada solicitud pendiente.</p></div><span className="requests-count">{pendingCount} pendientes</span></div>
      <div className="requests-table-wrap"><table className="requests-table"><thead><tr><th>Solicitante</th><th>Fecha</th><th>Hora</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        {requests.map(item => <tr key={item.id}>
          <td data-label="Solicitante"><div className="requests-person"><span className="requests-avatar" aria-hidden="true">{item.name.split(' ').slice(0, 2).map(part => part[0]).join('')}</span><span><strong>{item.name}</strong><small>{item.role}</small></span></div></td>
          <td data-label="Fecha"><span className="requests-meta"><CalendarDays size={14}/>{item.date}</span></td>
          <td data-label="Hora"><span className="requests-meta"><Clock3 size={14}/>{item.time}</span></td>
          <td data-label="Motivo"><span className="requests-motive">{item.motive}</span></td>
          <td data-label="Estado"><span className={`request-status status-${item.status.toLowerCase()}`}>{item.status}</span></td>
          <td data-label="Acciones"><div className="requests-actions"><button className="request-detail" type="button" onClick={() => setDetail(item)}><Eye size={15}/>Detalle</button>{item.status === 'Pendiente' ? <><button className="request-accept" type="button" onClick={() => setConfirm({ item, action: 'accept' })}><Check size={15}/>Aceptar</button><button className="request-reject" type="button" onClick={() => setConfirm({ item, action: 'reject' })}>Rechazar</button></> : <span className="request-no-action">Resuelta</span>}</div></td>
        </tr>)}
      </tbody></table></div>
      {requests.length === 0 && <p className="requests-empty">No tienes solicitudes recibidas.</p>}
      <p className="requests-demo-note">Acciones de demostración: los cambios se mantienen solo mientras esta pantalla esté abierta.</p>
    </section>

    {detail && <div className="requests-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDetail(null); }}><section className="requests-dialog" role="dialog" aria-modal="true" aria-labelledby="request-detail-title"><button className="requests-dialog-close" type="button" aria-label="Cerrar detalle" onClick={() => setDetail(null)}><X size={19}/></button><span className="requests-dialog-icon"><MessageSquareText size={21}/></span><p className="requests-eyebrow">DETALLE DE SOLICITUD</p><h2 id="request-detail-title">{detail.name}</h2><p className="requests-dialog-role">{detail.role}</p><div className="requests-dialog-facts"><span><CalendarDays size={16}/>{detail.date}</span><span><Clock3 size={16}/>{detail.time}</span><span className={`request-status status-${detail.status.toLowerCase()}`}>{detail.status}</span></div><h3>Motivo de la solicitud</h3><p className="requests-dialog-motive">{detail.motive}</p><button className="requests-dialog-done" type="button" onClick={() => setDetail(null)}>Volver a la bandeja</button></section></div>}
    {confirm && <div className="requests-backdrop" role="presentation"><section className="requests-dialog requests-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="request-confirm-title"><span className="requests-dialog-icon"><Check size={21}/></span><p className="requests-eyebrow">CONFIRMACIÓN</p><h2 id="request-confirm-title">{confirm.action === 'accept' ? '¿Aceptar esta solicitud?' : '¿Rechazar esta solicitud?'}</h2><p className="requests-dialog-motive">{confirm.item.name} recibirá una notificación sobre tu decisión.</p><div className="requests-confirm-actions"><button type="button" className="request-detail" onClick={() => setConfirm(null)}>Volver</button><button type="button" className={confirm.action === 'reject' ? 'request-reject' : 'request-accept'} onClick={perform}>{confirm.action === 'accept' ? 'Sí, aceptar' : 'Sí, rechazar'}</button></div></section></div>}
  </main>;
}
