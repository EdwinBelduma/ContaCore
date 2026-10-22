import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import DashboardPage from './pages/DashboardPage'
import IncomesPage from './pages/IncomesPage'
import LoginPage from './pages/LoginPage'

function ProtectedRoute({
                            children,
                        }: {
    children: React.ReactNode
}) {
    const token =
        localStorage.getItem('accessToken')

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    return children
}

function HomeRedirect() {
    const token =
        localStorage.getItem('accessToken')

    return (
        <Navigate
            to={
                token
                    ? '/dashboard'
                    : '/login'
            }
            replace
        />
    )
}

function App() {
    return (
        <Routes>

            <Route
                path="/"
                element={<HomeRedirect />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ingresos"
                element={
                    <ProtectedRoute>
                        <IncomesPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="*"
                element={<HomeRedirect />}
            />

        </Routes>
    )
}

export default App