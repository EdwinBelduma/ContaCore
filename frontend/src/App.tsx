import type {
    ReactNode,
} from 'react'

import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom'

import AppLayout from './layouts/AppLayout'

import CustomerDetailPage from './pages/CustomerDetailPage'
import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import EditCustomerPage from './pages/EditCustomerPage'
import EditSupplierPage from './pages/EditSupplierPage'
import ExpensesPage from './pages/ExpensesPage'
import IncomesPage from './pages/IncomesPage'
import LoginPage from './pages/LoginPage'
import NewCustomerPage from './pages/NewCustomerPage'
import NewExpensePage from './pages/NewExpensePage'
import NewIncomePage from './pages/NewIncomePage'
import NewReceivablePage from './pages/NewReceivablePage'
import NewSupplierPage from './pages/NewSupplierPage'
import ReceivableDetailPage from './pages/ReceivableDetailPage'
import ReceivablesPage from './pages/ReceivablesPage'
import SupplierDetailPage from './pages/SupplierDetailPage'
import SuppliersPage from './pages/SuppliersPage'

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
                element={
                    <HomeRedirect />
                }
            />

            {/* LOGIN */}

            <Route
                path="/login"
                element={
                    <LoginPage />
                }
            />

            {/* ÁREA PROTEGIDA */}

            <Route
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >

                {/* =========================
            DASHBOARD
        ========================= */}

                <Route
                    path="dashboard"
                    element={
                        <DashboardPage />
                    }
                />

                {/* =========================
            INGRESOS
        ========================= */}

                <Route
                    path="ingresos"
                    element={
                        <IncomesPage />
                    }
                />

                <Route
                    path="ingresos/nuevo"
                    element={
                        <NewIncomePage />
                    }
                />

                {/* =========================
            GASTOS
        ========================= */}

                <Route
                    path="gastos"
                    element={
                        <ExpensesPage />
                    }
                />

                <Route
                    path="gastos/nuevo"
                    element={
                        <NewExpensePage />
                    }
                />

                {/* =========================
            CLIENTES
        ========================= */}

                <Route
                    path="clientes"
                    element={
                        <CustomersPage />
                    }
                />

                <Route
                    path="clientes/nuevo"
                    element={
                        <NewCustomerPage />
                    }
                />

                <Route
                    path="clientes/:customerId/editar"
                    element={
                        <EditCustomerPage />
                    }
                />

                <Route
                    path="clientes/:customerId"
                    element={
                        <CustomerDetailPage />
                    }
                />

                {/* =========================
            PROVEEDORES
        ========================= */}

                <Route
                    path="proveedores"
                    element={
                        <SuppliersPage />
                    }
                />

                <Route
                    path="proveedores/nuevo"
                    element={
                        <NewSupplierPage />
                    }
                />

                <Route
                    path="proveedores/:supplierId/editar"
                    element={
                        <EditSupplierPage />
                    }
                />

                <Route
                    path="proveedores/:supplierId"
                    element={
                        <SupplierDetailPage />
                    }
                />

                {/* =========================
            CUENTAS POR COBRAR
        ========================= */}

                <Route
                    path="cuentas-por-cobrar"
                    element={
                        <ReceivablesPage />
                    }
                />

                <Route
                    path="cuentas-por-cobrar/nueva"
                    element={
                        <NewReceivablePage />
                    }
                />

                <Route
                    path="cuentas-por-cobrar/:obligationId"
                    element={
                        <ReceivableDetailPage />
                    }
                />

            </Route>

            {/* =========================
          RUTA DESCONOCIDA
      ========================= */}

            <Route
                path="*"
                element={
                    <HomeRedirect />
                }
            />

        </Routes>
    )
}

export default App