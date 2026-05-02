const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

// Listar clientes
router.get('/', verificarToken, async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) return res.status(400).json({ error: error.message });
  
  const { data: usuariosCliente } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, telefono, empresa')
    .eq('rol', 'cliente');

  const clientesDeTabla = data || [];
  const clientesDeUsuarios = (usuariosCliente || []).map(u => ({
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    telefono: u.telefono || '-',
    empresa: u.empresa || 'Cliente registrado',
    estado: 'activo',
    es_usuario: true
  }));

  res.json([...clientesDeTabla, ...clientesDeUsuarios]);
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

// *** IMPORTANTE: Esta ruta debe ir ANTES de /:id ***
// Editar cliente que es usuario
router.put('/usuario/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono, empresa } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, correo, telefono, empresa })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: 'Cliente actualizado', cliente: data[0] });
});

// Editar cliente normal
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