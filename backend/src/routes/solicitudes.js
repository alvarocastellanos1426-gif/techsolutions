const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

router.post('/', verificarToken, async (req, res) => {
  const { titulo, descripcion } = req.body;
  const cliente_id = req.usuario.id;
  const { data, error } = await supabase
    .from('solicitudes_proyectos')
    .insert([{ titulo, descripcion, cliente_id }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Solicitud enviada correctamente', solicitud: data[0] });
});

router.get('/', verificarToken, async (req, res) => {
  let query = supabase
    .from('solicitudes_proyectos')
    .select('*, usuarios(nombre, correo)');
  if (req.usuario.rol === 'cliente') {
    query = query.eq('cliente_id', req.usuario.id);
  }
  const { data, error } = await query.order('creado_en', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.put('/:id', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }
  const { id } = req.params;
  const { estado, proyecto_id } = req.body;

  try {
    let proyectoFinal = proyecto_id || null;

    // Si se aprueba y no hay proyecto vinculado, crear uno automáticamente
    if (estado === 'aprobado' && !proyecto_id) {
      const { data: solicitud } = await supabase
        .from('solicitudes_proyectos')
        .select('titulo, descripcion, cliente_id')
        .eq('id', id)
        .single();

      const { data: nuevoProyecto, error: errorProyecto } = await supabase
  .from('proyectos')
  .insert([{
    nombre: solicitud.titulo,
    descripcion: solicitud.descripcion,
    estado: 'pendiente',
    cliente_id: solicitud.cliente_id
  }])
        
        .select()
        .single();

      if (errorProyecto) return res.status(400).json({ error: errorProyecto.message });
      proyectoFinal = nuevoProyecto.id;
    }

    const { data, error } = await supabase
      .from('solicitudes_proyectos')
      .update({ estado, proyecto_id: proyectoFinal })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: 'Solicitud actualizada', solicitud: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;