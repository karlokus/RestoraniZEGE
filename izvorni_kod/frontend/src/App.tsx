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
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {

  return (
    <main className='main-content'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register-restaurant' element={<RegisterRestaurant />} />
        
        {/* samo ulogirani korisnici */}
        <Route path='/profile' element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path='/filter' element={<Filter />} />
        
        {/* samo za vlasnike restorana */}
        <Route path='/dashboard' element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/create-restaurant' element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <CreateRestaurant />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/edit-restaurant/:id' element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <EditRestaurant />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/manage-photos/:id' element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <ManagePhotos />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/manage-events/:id' element={
          <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
            <ManageEvents />
          </ProtectedRoute>
        } />
        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path='*' element={<Navigate to='/' />} /> // automatsko preusmjeravanje na homepage za nepoznate rute (URL-ove)
      </Routes>
    </main>
  );
}

export default App
