const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const verificarToken = require('../middleware/auth');

// Registro
router.post('/registro', async (req, res) => {
  const { nombre, correo, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, password: hash, rol: rol || 'trabajador' }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ mensaje: 'Usuario registrado correctamente', usuario: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single();
    if (error || !data) return res.status(400).json({ error: 'Usuario no encontrado' });
    const valido = await bcrypt.compare(password, data.password);
    // Verificar si el trabajador está aprobado
    if (data.rol === 'trabajador' && !data.aprobado) {
    return res.status(403).json({ error: 'Tu cuenta está pendiente de aprobación por el administrador.' });
    }
    if (!valido) return res.status(400).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { id: data.id, correo: data.correo, rol: data.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, usuario: { id: data.id, nombre: data.nombre, correo: data.correo, rol: data.rol } });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener lista de trabajadores
router.get('/trabajadores', verificarToken, async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo')
    .eq('rol', 'trabajador');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Listar usuarios pendientes de aprobación
router.get('/pendientes', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'No autorizado' });
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, rol, aprobado, creado_en')
    .eq('rol', 'trabajador')
    .eq('aprobado', false);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Aprobar o rechazar usuario
router.put('/aprobar/:id', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'admin') return res.status(403).json({ error: 'No autorizado' });
  const { id } = req.params;
  const { aprobado } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .update({ aprobado })
    .eq('id', id)
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ mensaje: aprobado ? 'Usuario aprobado' : 'Usuario rechazado', usuario: data[0] });
});

module.exports = router;