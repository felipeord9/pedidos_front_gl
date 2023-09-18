import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputPassword from '../../components/InputPassword'
import useUser from '../../hooks/useUser';
//import Logo from '../../assets'
import './styles.css'

export default function Login() {
  const { login, isLoginLoading, hasLoginError, isLogged } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isLogged) navigate('/home');
  }, [isLogged, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div id='wrapper' className='d-flex justify-content-center align-items-center vh-100 w-100 m-auto'>
      <div className='card p-4'>
        <div>
          <img src='#' className='w-100' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-2' onSubmit={handleLogin}>
          <div>
            <label className='fw-bold'>Usuario</label>
            <input
              type='email'
              value={email}
              className='form-control form-control-sm shadow-sm'
              placeholder='Usuario'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <InputPassword label="Contraseña" password={password} setPassword={setPassword} />
          </div>
          <button type='submit' className='btn btn-sm btn-dark'>Ingresar</button>
        </form>
        {isLoginLoading && <div className="loading">Cargando...</div>}
        {hasLoginError && <div className="text-danger text-center mt-2">Usuario o contraseña incorrectos</div>}
        <Link to="/recovery-password" className="text-primary text-center text-decoration-none mt-2">¿Olvido su contraseña?</Link>
      </div>
    </div>
  )
}