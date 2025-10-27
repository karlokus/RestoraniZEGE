import './css/App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </main>
  );
}

export default App
