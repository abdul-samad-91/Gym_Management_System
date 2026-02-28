import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';
import {Link} from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        setAuth(user, token);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('../assets/bgImage.png')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md px-12 py-20">
        {/* <div className="flex justify-center mb-6"> */}
          {/* <div className="flex items-center space-x-2"> */}
            {/* <Dumbbell className="w-10 h-10 text-primary-600" /> */}
            {/* <div>
              <h1 className="text-2xl font-bold text-gray-900">GMS</h1>
              <p className="text-2xl text-gray-500">Gym Management System</p>
            </div> */}
          {/* </div> */}
        {/* </div> */}

       <div >
         <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className=" text-center text-gray-500 pb-6 font-normal">Sign in to your admin account</p>
       </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Email Address</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Enter your Email Address"
              required
            />
          </div>

          <div>
            <div className='flex justify-between'>
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-sm font-400 text-[#6366F1] hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Eye className="w-5 h-5" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Demo: username: <strong>admin</strong>, password: <strong>admin123</strong>
          </p>
        </div> */}
      </div>
    </div>
  );
}

