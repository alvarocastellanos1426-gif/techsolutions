import { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';

const GraficasTareas = () => {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    api.get('/tareas').then(res => setTareas(res.data));
  }, []);

  const contar = (campo, valor) => tareas.filter(t => t[campo] === valor).length;
  const total = tareas.length;
  const porcentaje = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

  const estados = [
    { label: 'Pendiente', valor: 'pendiente', color: 'bg-gray-400' },
    { label: 'En progreso', valor: 'en progreso', color: 'bg-yellow-400' },
    { label: 'Completado', valor: 'completado', color: 'bg-green-500' },
  ];

  const prioridades = [
    { label: 'Alta', valor: 'alta', color: 'bg-red-500' },
    { label: 'Media', valor: 'media', color: 'bg-yellow-400' },
    { label: 'Baja', valor: 'baja', color: 'bg-green-400' },
  ];

  const handleDescargarPDF = async () => {
    const { default: jsPDF } = await import('https://esm.sh/jspdf@2.5.1');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('TechSolutions - Reporte de Tareas', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total de tareas: ${total}`, 20, 40);

    doc.setFontSize(14);
    doc.text('Por Estado:', 20, 55);
    estados.forEach((e, i) => {
      const n = contar('estado', e.valor);
      doc.setFontSize(12);
      doc.text(`  ${e.label}: ${n} tareas (${porcentaje(n)}%)`, 20, 65 + i * 10);
    });

    doc.setFontSize(14);
    doc.text('Por Prioridad:', 20, 105);
    prioridades.forEach((p, i) => {
      const n = contar('prioridad', p.valor);
      doc.setFontSize(12);
      doc.text(`  ${p.label}: ${n} tareas (${porcentaje(n)}%)`, 20, 115 + i * 10);
    });

    doc.setFontSize(14);
    doc.text('Detalle de tareas:', 20, 150);
    tareas.forEach((t, i) => {
      if (160 + i * 10 > 280) return;
      doc.setFontSize(10);
      doc.text(`  ${t.nombre} — ${t.estado} — Prioridad: ${t.prioridad} — Responsable: ${t.responsable || 'N/A'}`, 20, 160 + i * 10);
    });

    doc.save('reporte-tareas.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gráficas de Avance</h2>
          <button
            onClick={handleDescargarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
            Descargar PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Por Estado</h3>
            {estados.map(e => {
              const n = contar('estado', e.valor);
              const pct = porcentaje(n);
              return (
                <div key={e.valor} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{e.label}</span>
                    <span className="font-semibold">{n} tareas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`${e.color} h-4 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Por Prioridad</h3>
            {prioridades.map(p => {
              const n = contar('prioridad', p.valor);
              const pct = porcentaje(n);
              return (
                <div key={p.valor} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-semibold">{n} tareas ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`${p.color} h-4 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Resumen general</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-gray-700">{total}</p>
                <p className="text-sm text-gray-500 mt-1">Total tareas</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-green-600">{contar('estado', 'completado')}</p>
                <p className="text-sm text-gray-500 mt-1">Completadas</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-3xl font-bold text-yellow-600">{contar('estado', 'en progreso')}</p>
                <p className="text-sm text-gray-500 mt-1">En progreso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficasTareas;