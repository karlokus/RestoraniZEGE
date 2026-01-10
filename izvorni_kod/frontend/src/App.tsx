import './css/App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterRestaurant from './pages/RegisterRestaurant'
import Profile from './pages/Profile'
import Filter from './pages/Filter'
import Dashboard from './pages/Dashboard'
import CreateRestaurant from './pages/CreateRestaurant'
import EditRestaurant from './pages/EditRestaurant'
import ManagePhotos from './pages/ManagePhotos'
import ManageEvents from './pages/ManageEvents'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {

  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register-restaurant' element={<RegisterRestaurant />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/filter' element={<Filter />} />
        
        {/* Restaurant owner dashboard routes */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/dashboard/create-restaurant' element={<CreateRestaurant />} />
        <Route path='/dashboard/edit-restaurant/:id' element={<EditRestaurant />} />
        <Route path='/dashboard/manage-photos/:id' element={<ManagePhotos />} />
        <Route path='/dashboard/manage-events/:id' element={<ManageEvents />} />

        <Route path='*' element={<Navigate to='/' />} /> // automatsko preusmjeravanje na homepage za nepoznate rute (URL-ove)
      </Routes>
    </main>
  );
}

export default App
