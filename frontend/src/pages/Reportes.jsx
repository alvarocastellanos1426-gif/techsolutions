import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Reportes = () => {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === 'admin';
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [proyectoFiltro, setProyectoFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      if (esAdmin) {
        const [t, p, h] = await Promise.all([
          api.get('/tareas'),
          api.get('/proyectos'),
          api.get('/tareas/historial/todas')
        ]);
        setTareas(t.data);
        setProyectos(p.data);
        setHistorial(h.data);
      } else {
        const [t, h] = await Promise.all([
          api.get('/tareas'),
          api.get(`/tareas/historial/usuario/${usuario.id}`)
        ]);
        setTareas(t.data.filter(tarea => tarea.usuario_id === usuario.id));
        setHistorial(h.data);
      }
    } catch (err) {
      console.error(err);
    }
    setCargando(false);
  };

  const tareasFiltradas = proyectoFiltro === 'todos'
    ? tareas
    : tareas.filter(t => t.proyecto_id === proyectoFiltro);

  const historialFiltrado = proyectoFiltro === 'todos'
    ? historial
    : historial.filter(h => h.tareas?.proyecto_id === proyectoFiltro);

  const contar = (campo, valor, lista = tareasFiltradas) =>
    lista.filter(t => t[campo] === valor).length;

  const total = tareasFiltradas.length;
  const pct = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

  const estados = [
    { label: 'Pendiente', valor: 'pendiente', color: '#9CA3AF', bg: '#F3F4F6' },
    { label: 'En progreso', valor: 'en progreso', color: '#D97706', bg: '#FEF9C3' },
    { label: 'Completado', valor: 'completado', color: '#16A34A', bg: '#DCFCE7' },
  ];

  const prioridades = [
    { label: 'Alta', valor: 'alta', color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Media', valor: 'media', color: '#D97706', bg: '#FEF9C3' },
    { label: 'Baja', valor: 'baja', color: '#16A34A', bg: '#DCFCE7' },
  ];

  const colorEstado = (estado) => {
    if (estado === 'completado') return 'bg-green-100 text-green-700';
    if (estado === 'en progreso') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const calcularTiempo = (h, index, lista) => {
    const siguiente = lista[index + 1];
    if (!siguiente || siguiente.tarea_id !== h.tarea_id) return '-';
    const diff = new Date(siguiente.creado_en) - new Date(h.creado_en);
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };

  const handleDescargarPDF = async () => {
    const { default: jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
    const doc = new jsPDF();

    const dibujarBarra = (x, y, ancho, porcentaje, color) => {
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(x, y, ancho, 8, 2, 2, 'F');
      if (porcentaje > 0) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
        doc.roundedRect(x, y, Math.max((ancho * porcentaje) / 100, 2), 8, 2, 2, 'F');
      }
    };

    // ENCABEZADO
    doc.setFillColor(29, 78, 216);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TechSolutions', 14, 13);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Tareas', 14, 22);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 13);
    doc.text(`Usuario: ${usuario?.nombre}`, 140, 22);

    // RESUMEN
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 14, 42);

    const cajas = [
      { label: 'Total', valor: total, color: [239, 246, 255], texto: [29, 78, 216] },
      { label: 'Completadas', valor: contar('estado', 'completado'), color: [220, 252, 231], texto: [22, 163, 74] },
      { label: 'En Progreso', valor: contar('estado', 'en progreso'), color: [254, 249, 195], texto: [217, 119, 6] },
    ];
    cajas.forEach((caja, i) => {
      const x = 14 + i * 62;
      doc.setFillColor(...caja.color);
      doc.roundedRect(x, 46, 58, 22, 3, 3, 'F');
      doc.setTextColor(...caja.texto);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(String(caja.valor), x + 29, 57, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(caja.label, x + 29, 64, { align: 'center' });
    });

    // BARRAS ESTADOS
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Estado', 14, 82);
    const coloresEstados = { 'pendiente': '#9CA3AF', 'en progreso': '#D97706', 'completado': '#16A34A' };
    estados.forEach((e, i) => {
      const n = contar('estado', e.valor);
      const p = pct(n);
      const y = 88 + i * 16;
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(e.label, 14, y + 6);
      dibujarBarra(50, y, 100, p, coloresEstados[e.valor]);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text(`${n} (${p}%)`, 155, y + 6);
    });

    // BARRAS PRIORIDADES
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Prioridad', 14, 142);
    const coloresPrioridades = { 'alta': '#DC2626', 'media': '#D97706', 'baja': '#16A34A' };
    prioridades.forEach((p, i) => {
      const n = contar('prioridad', p.valor);
      const pc = pct(n);
      const y = 148 + i * 16;
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(p.label, 14, y + 6);
      dibujarBarra(50, y, 100, pc, coloresPrioridades[p.valor]);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text(`${n} (${pc}%)`, 155, y + 6);
    });

    // HISTORIAL CON TIEMPOS
    let yPos = 200;
    if (historialFiltrado.length > 0) {
      doc.addPage();
      yPos = 20;
      doc.setFillColor(29, 78, 216);
      doc.rect(0, 0, 210, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Historial de Cambios de Estado', 105, 9, { align: 'center' });
      yPos = 24;

      // Encabezado tabla
      doc.setFillColor(124, 58, 237);
      doc.rect(14, yPos, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Tarea', 16, yPos + 5.5);
      doc.text('Estado anterior', 70, yPos + 5.5);
      doc.text('Estado nuevo', 110, yPos + 5.5);
      doc.text('Fecha', 148, yPos + 5.5);
      doc.text('Tiempo', 178, yPos + 5.5);
      yPos += 10;

      historialFiltrado.slice(0, 25).forEach((h, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, yPos - 2, 182, 8, 'F');
        }
        const tiempo = calcularTiempo(h, index, historialFiltrado);
        doc.setTextColor(31, 41, 55);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text((h.tareas?.nombre || '-').substring(0, 22), 16, yPos + 4);
        doc.setTextColor(107, 114, 128);
        doc.text(h.estado_anterior || '-', 70, yPos + 4);
        doc.setTextColor(22, 163, 74);
        doc.text(h.estado_nuevo || '-', 110, yPos + 4);
        doc.setTextColor(107, 114, 128);
        doc.text(new Date(h.creado_en).toLocaleDateString(), 148, yPos + 4);
        doc.setTextColor(29, 78, 216);
        doc.text(tiempo, 178, yPos + 4);
        yPos += 8;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // FOOTER
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFillColor(243, 244, 246);
      doc.rect(0, 282, 210, 15, 'F');
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8);
      doc.text('TechSolutions S.A. — Sistema de Gestión Empresarial', 105, 290, { align: 'center' });
      doc.text(`Página ${i} de ${totalPaginas} — Generado el ${new Date().toLocaleString()}`, 105, 295, { align: 'center' });
    }

    const nombre = esAdmin
      ? `reporte-admin-${proyectoFiltro === 'todos' ? 'general' : 'proyecto'}.pdf`
      : `reporte-${usuario?.nombre}.pdf`;
    doc.save(nombre);
  };

  if (cargando) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando reporte...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {esAdmin ? 'Reportes — Administrador' : 'Mi Reporte de Trabajo'}
          </h2>
          <button onClick={handleDescargarPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Descargar PDF
          </button>
        </div>

        {esAdmin && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <label className="text-sm font-medium text-gray-700 mr-3">Filtrar por proyecto:</label>
            <select value={proyectoFiltro} onChange={e => setProyectoFiltro(e.target.value)} className="border rounded-lg px-4 py-2 text-sm">
              <option value="todos">Todos los proyectos</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-gray-700">{total}</p>
            <p className="text-sm text-gray-500 mt-1">Total tareas</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-green-600">{contar('estado', 'completado')}</p>
            <p className="text-sm text-gray-500 mt-1">Completadas</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow p-6 text-center">
            <p className="text-4xl font-bold text-yellow-600">{contar('estado', 'en progreso')}</p>
            <p className="text-sm text-gray-500 mt-1">En progreso</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Por Estado</h3>
            {estados.map(e => {
              const n = contar('estado', e.valor);
              const p = pct(n);
              return (
                <div key={e.valor} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{e.label}</span>
                    <span className="font-semibold">{n} tareas ({p}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-5">
                    <div className="h-5 rounded-full transition-all duration-500"
                      style={{ width: `${p}%`, backgroundColor: e.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Por Prioridad</h3>
            {prioridades.map(p => {
              const n = contar('prioridad', p.valor);
              const pct2 = pct(n);
              return (
                <div key={p.valor} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-semibold">{n} tareas ({pct2}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-5">
                    <div className="h-5 rounded-full transition-all duration-500"
                      style={{ width: `${pct2}%`, backgroundColor: p.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {historialFiltrado.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Historial de cambios de estado</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Tarea</th>
                    {esAdmin && <th className="p-3 text-left">Trabajador</th>}
                    <th className="p-3 text-left">Estado anterior</th>
                    <th className="p-3 text-left">Estado nuevo</th>
                    <th className="p-3 text-left">Fecha de cambio</th>
                    <th className="p-3 text-left">Tiempo en estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historialFiltrado.map((h, index) => {
                    const tiempo = calcularTiempo(h, index, historialFiltrado);
                    return (
                      <tr key={h.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{h.tareas?.nombre || '-'}</td>
                        {esAdmin && <td className="p-3 text-gray-500">{h.usuarios?.nombre || '-'}</td>}
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstado(h.estado_anterior)}`}>
                            {h.estado_anterior}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorEstado(h.estado_nuevo)}`}>
                            {h.estado_nuevo}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(h.creado_en).toLocaleDateString('es-ES', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-semibold">
                            {tiempo}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold text-gray-700">
              {esAdmin ? 'Detalle de tareas' : 'Mis tareas'}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-3 text-left">Tarea</th>
                <th className="p-3 text-left">Responsable</th>
                <th className="p-3 text-left">Proyecto</th>
                <th className="p-3 text-left">Prioridad</th>
                <th className="p-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map(t => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{t.nombre}</td>
                  <td className="p-3">{t.responsable || '-'}</td>
                  <td className="p-3">{t.proyectos?.nombre || '-'}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: prioridades.find(p => p.valor === t.prioridad)?.bg, color: prioridades.find(p => p.valor === t.prioridad)?.color }}>
                      {t.prioridad}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: estados.find(e => e.valor === t.estado)?.bg, color: estados.find(e => e.valor === t.estado)?.color }}>
                      {t.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {tareasFiltradas.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No hay tareas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reportes;