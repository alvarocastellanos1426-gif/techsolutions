const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

router.get('/', verificarToken, async (req, res) => {
  const { data, error } = await supabase
    .from('tareas')
    .select('*, proyectos(nombre)');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', verificarToken, async (req, res) => {
  const { nombre, responsable, prioridad, estado, proyecto_id, usuario_id } = req.body;
  const { data, error } = await supabase
    .from('tareas')
    .insert([{ 
      nombre, 
      responsable, 
      prioridad, 
      estado, 
      proyecto_id: proyecto_id || null,
      usuario_id: usuario_id || null
    }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Tarea creada', tarea: data[0] });
});

router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, responsable, prioridad, estado, proyecto_id, usuario_id } = req.body;

  try {
    // Obtener tarea actual para guardar estado anterior
    const { data: tareaActual } = await supabase
      .from('tareas')
      .select('estado')
      .eq('id', id)
      .single();

    // Actualizar tarea
    const { data, error } = await supabase
      .from('tareas')
      .update({ nombre, responsable, prioridad, estado, proyecto_id: proyecto_id || null, usuario_id: usuario_id || null })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    // Guardar historial si cambió el estado
    if (tareaActual && tareaActual.estado !== estado) {
      await supabase.from('historial_tareas').insert([{
        tarea_id: id,
        estado_anterior: tareaActual.estado,
        estado_nuevo: estado,
        usuario_id: req.usuario.id
      }]);
    }

    res.json({ mensaje: 'Tarea actualizada', tarea: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('tareas').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Tarea eliminada' });
});

// Historial de una tarea
router.get('/:id/historial', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('historial_tareas')
    .select('*, usuarios(nombre)')
    .eq('tarea_id', id)
    .order('creado_en', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Historial de tareas por usuario (para trabajador)
router.get('/historial/usuario/:userId', verificarToken, async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('historial_tareas')
    .select('*, tareas(nombre, proyecto_id, proyectos(nombre)), usuarios(nombre)')
    .eq('usuario_id', userId)
    .order('tarea_id', { ascending: true })
    .order('creado_en', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Historial de todas las tareas (para admin)
router.get('/historial/todas', verificarToken, async (req, res) => {
  const { data, error } = await supabase
    .from('historial_tareas')
    .select('*, tareas(nombre, proyecto_id, proyectos(nombre)), usuarios(nombre)')
    .order('tarea_id', { ascending: true })
    .order('creado_en', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;