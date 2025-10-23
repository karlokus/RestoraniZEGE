import './css/App.css'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
function App() {

  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Home />} /> // Placeholder for Login page - trenutno sam stavio Home
      </Routes>
    </main>
  );
}

export default App
