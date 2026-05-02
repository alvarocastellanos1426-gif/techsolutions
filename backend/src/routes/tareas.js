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
  const { data, error } = await supabase
    .from('tareas')
    .update({ 
      nombre, 
      responsable, 
      prioridad, 
      estado, 
      proyecto_id: proyecto_id || null,
      usuario_id: usuario_id || null
    })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Tarea actualizada', tarea: data[0] });
});

router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('tareas').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Tarea eliminada' });
});

module.exports = router;