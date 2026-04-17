import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar/Navbar'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Recipes from './pages/Recipes/Recipes'
import MealPlanner from './pages/MealPlanner/MealPlanner'
import MealPlanDetail from './pages/MealPlanDetail/MealPlanDetail'
import Shopping from './pages/Shopping/Shopping'
import Profile from './pages/Profile/Profile'

const BG = 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600)'

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>Loading...</div>
    return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>Loading...</div>
    return user ? <Navigate to="/recipes" /> : children
}

const PageWrapper = ({ children }) => (
    <div style={{
        minHeight: '100dvh',
        backgroundImage: BG,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }}>
        <div style={{ minHeight: '100dvh', background: 'rgba(0,0,0,0.4)' }}>
            {children}
        </div>
    </div>
)

const App = () => {
    return (
        <div style={{ minHeight: '100dvh' }}>
            <Navbar />
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/recipes" element={<PrivateRoute><PageWrapper><Recipes /></PageWrapper></PrivateRoute>} />
                <Route path="/meal-planner" element={<PrivateRoute><PageWrapper><MealPlanner /></PageWrapper></PrivateRoute>} />
                <Route path="/meal-planner/:planId" element={<PrivateRoute><PageWrapper><MealPlanDetail /></PageWrapper></PrivateRoute>} />
                <Route path="/shopping/:planId" element={<PrivateRoute><PageWrapper><Shopping /></PageWrapper></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><PageWrapper><Profile /></PageWrapper></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    )
}

export default App