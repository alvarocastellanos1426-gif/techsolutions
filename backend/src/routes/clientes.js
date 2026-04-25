const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

// Listar clientes
router.get('/', verificarToken, async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Crear cliente
router.post('/', verificarToken, async (req, res) => {
  const { nombre, correo, telefono, empresa, estado } = req.body;
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre, correo, telefono, empresa, estado }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Cliente creado', cliente: data[0] });
});

// Editar cliente
router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono, empresa, estado } = req.body;
  const { data, error } = await supabase
    .from('clientes')
    .update({ nombre, correo, telefono, empresa, estado })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Cliente actualizado', cliente: data[0] });
});

// Eliminar cliente
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Cliente eliminado' });
});

module.exports = router;