import type {
    ReactNode,
} from 'react'

import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'

import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import ExpensesPage from './pages/ExpensesPage'
import IncomesPage from './pages/IncomesPage'
import LoginPage from './pages/LoginPage'
import NewExpensePage from './pages/NewExpensePage'
import NewIncomePage from './pages/NewIncomePage'

function ProtectedRoute({
                            children,
                        }: {
    children: ReactNode
}) {
    const token =
        localStorage.getItem(
            'accessToken',
        )

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
        localStorage.getItem(
            'accessToken',
        )

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

            {/* INICIO */}

            <Route
                path="/"
                element={<HomeRedirect />}
            />

            {/* LOGIN */}

            <Route
                path="/login"
                element={<LoginPage />}
            />

            {/* PÁGINAS PROTEGIDAS CON MENÚ LATERAL */}

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >

                {/* DASHBOARD */}

                <Route
                    path="/dashboard"
                    element={
                        <DashboardPage />
                    }
                />

                {/* INGRESOS */}

                <Route
                    path="/ingresos"
                    element={
                        <IncomesPage />
                    }
                />

                <Route
                    path="/ingresos/nuevo"
                    element={
                        <NewIncomePage />
                    }
                />

                {/* GASTOS */}

                <Route
                    path="/gastos"
                    element={
                        <ExpensesPage />
                    }
                />

                <Route
                    path="/gastos/nuevo"
                    element={
                        <NewExpensePage />
                    }
                />

                {/* CLIENTES */}

                <Route
                    path="/clientes"
                    element={
                        <CustomersPage />
                    }
                />

            </Route>

            {/* CUALQUIER OTRA RUTA */}

            <Route
                path="*"
                element={<HomeRedirect />}
            />

        </Routes>
    )
}

export default App