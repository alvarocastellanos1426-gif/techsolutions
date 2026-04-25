const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

// Listar proyectos
router.get('/', verificarToken, async (req, res) => {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*, clientes(nombre)');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear proyecto
router.post('/', verificarToken, async (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado, cliente_id } = req.body;
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ nombre, descripcion, fecha_inicio, fecha_fin, estado, cliente_id }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Proyecto creado', proyecto: data[0] });
});

// Editar proyecto
router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado, cliente_id } = req.body;
  const { data, error } = await supabase
    .from('proyectos')
    .update({ nombre, descripcion, fecha_inicio, fecha_fin, estado, cliente_id })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Proyecto actualizado', proyecto: data[0] });
});

// Eliminar proyecto
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('proyectos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Proyecto eliminado' });
});

module.exports = router;