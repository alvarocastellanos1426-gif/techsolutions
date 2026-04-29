import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.usuario);
      navigate('/dashboard');
    } catch (err) {
      alert('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">TechSolutions</h1>
        <p className="text-center text-gray-500 mb-6">Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              {...register('correo', { required: 'El correo es obligatorio' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@techsolutions.com"
            />
            {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password', { required: 'La contraseña es obligatoria' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition">
            Iniciar sesión
          </button>
          <p className="text-center text-sm text-gray-500 mt-2">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-blue-700 font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;