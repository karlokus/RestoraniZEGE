import './css/App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Filter from './pages/Filter'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {

  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/filter' element={<Filter />} />

        <Route path='*' element={<Navigate to='/' />} /> // automatsko preusmjeravanje na homepage za nepoznate rute (URL-ove)
      </Routes>
    </main>
  );
}

export default App
