const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

// Listar proyectos
router.get('/', verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('proyectos')
      .select('*');
    if (error) return res.status(400).json({ error: error.message });

    // Obtener clientes y usuarios para mostrar el nombre
    const { data: clientes } = await supabase.from('clientes').select('id, nombre');
    const { data: usuarios } = await supabase.from('usuarios').select('id, nombre').eq('rol', 'cliente');

    const todosLosClientes = [...(clientes || []), ...(usuarios || [])];

    const proyectosConCliente = data.map(p => ({
      ...p,
      clientes: todosLosClientes.find(c => c.id === p.cliente_id) || null
    }));

    res.json(proyectosConCliente);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear proyecto
router.post('/', verificarToken, async (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado, cliente_id } = req.body;
  const { data, error } = await supabase
    .from('proyectos')
    .insert([{ nombre, descripcion, fecha_inicio: fecha_inicio || null, fecha_fin: fecha_fin || null, estado, cliente_id: cliente_id || null }])
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
    .update({ nombre, descripcion, fecha_inicio: fecha_inicio || null, fecha_fin: fecha_fin || null, estado, cliente_id: cliente_id || null })
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