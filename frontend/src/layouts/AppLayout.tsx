import {
    Bell,
    BookOpenText,
    Building2,
    ChevronDown,
    CircleDollarSign,
    FileBarChart,
    HandCoins,
    Home,
    LogOut,
    ReceiptText,
    Search,
    Users,
    WalletCards,
} from 'lucide-react'

import {
    useEffect,
    useState,
} from 'react'

import {
    Outlet,
    useLocation,
    useNavigate,
} from 'react-router-dom'

import {
    getCurrentUser,
    type CurrentUserResponse,
} from '../services/authService'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()

    const [user, setUser] =
        useState<CurrentUserResponse | null>(
            null,
        )

    const [entity, setEntity] =
        useState<AccountingEntity | null>(
            null,
        )

    useEffect(() => {
        const loadLayout = async () => {
            try {
                const [
                    currentUser,
                    entities,
                ] = await Promise.all([
                    getCurrentUser(),
                    getAccountingEntities(),
                ])

                setUser(currentUser)

                const selectedEntity =
                    entities.find(
                        (item) => item.active,
                    ) ?? entities[0]

                setEntity(
                    selectedEntity ?? null,
                )
            } catch (error) {
                console.error(
                    'Error cargando layout:',
                    error,
                )
            }
        }

        loadLayout()
    }, [])

    const handleLogout = () => {
        localStorage.removeItem(
            'accessToken',
        )

        navigate(
            '/login',
            {
                replace: true,
            },
        )
    }

    const primaryRole =
        user?.roles?.[0] ??
        'USUARIO'

    const isActive = (
        path: string,
    ) => {
        if (path === '/dashboard') {
            return (
                location.pathname ===
                '/dashboard'
            )
        }

        return location.pathname.startsWith(
            path,
        )
    }

    const menuClass = (
        path: string,
    ) => {
        return isActive(path)
            ? 'flex w-full items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20'
            : 'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white'
    }

    return (
        <main className="min-h-screen bg-[#020817] text-white">

            <div className="flex min-h-screen">

                {/* SIDEBAR */}

                <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-800/80 bg-[#050d1c] lg:flex">

                    {/* LOGO */}

                    <div className="flex h-[78px] items-center gap-3 border-b border-slate-800/80 px-6">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-lg font-black shadow-lg shadow-blue-600/20">
                            C
                        </div>

                        <div>

                            <h1 className="font-bold">
                                ContaCore
                            </h1>

                            <p className="text-[11px] text-slate-500">
                                Gestión contable
                            </p>

                        </div>

                    </div>

                    {/* ENTIDAD ACTUAL */}

                    {entity && (
                        <div className="mx-4 mt-4 rounded-xl border border-blue-400/10 bg-blue-500/5 px-4 py-3">

                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Entidad actual
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-300">
                                {entity.displayName}
                            </p>

                        </div>
                    )}

                    {/* MENÚ */}

                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">

                        {/* PRINCIPAL */}

                        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Principal
                        </p>

                        {/* DASHBOARD */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/dashboard')
                            }
                            className={menuClass(
                                '/dashboard',
                            )}
                        >
                            <Home size={18} />
                            Dashboard
                        </button>

                        {/* INGRESOS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/ingresos')
                            }
                            className={menuClass(
                                '/ingresos',
                            )}
                        >
                            <HandCoins size={18} />
                            Ingresos
                        </button>

                        {/* GASTOS */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/gastos')
                            }
                            className={menuClass(
                                '/gastos',
                            )}
                        >
                            <ReceiptText size={18} />
                            Gastos
                        </button>

                        {/* GESTIÓN */}

                        <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Gestión
                        </p>

                        {/* CLIENTES */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/clientes')
                            }
                            className={menuClass(
                                '/clientes',
                            )}
                        >
                            <Users size={18} />
                            Clientes
                        </button>

                        {/* PROVEEDORES */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/proveedores')
                            }
                            className={menuClass(
                                '/proveedores',
                            )}
                        >
                            <Building2 size={18} />
                            Proveedores
                        </button>

                        {/* CUENTAS POR COBRAR */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/cuentas-por-cobrar',
                                )
                            }
                            className={menuClass(
                                '/cuentas-por-cobrar',
                            )}
                        >
                            <WalletCards size={18} />
                            Cuentas por cobrar
                        </button>

                        {/* CUENTAS POR PAGAR */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/cuentas-por-pagar',
                                )
                            }
                            className={menuClass(
                                '/cuentas-por-pagar',
                            )}
                        >
                            <CircleDollarSign
                                size={18}
                            />
                            Cuentas por pagar
                        </button>

                        {/* CONTABILIDAD */}

                        <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                            Contabilidad
                        </p>

                        {/* ASIENTOS CONTABLES */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/asientos')
                            }
                            className={menuClass(
                                '/asientos',
                            )}
                        >
                            <BookOpenText
                                size={18}
                            />
                            Asientos contables
                        </button>

                        {/* REPORTES */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate('/reportes')
                            }
                            className={menuClass(
                                '/reportes',
                            )}
                        >
                            <FileBarChart
                                size={18}
                            />
                            Reportes
                        </button>

                    </nav>

                    {/* CERRAR SESIÓN */}

                    <div className="border-t border-slate-800/80 p-4">

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                            <LogOut size={18} />
                            Cerrar sesión
                        </button>

                    </div>

                </aside>

                {/* PARTE DERECHA */}

                <div className="flex min-w-0 flex-1 flex-col">

                    {/* HEADER */}

                    <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#061126]/80 px-6 backdrop-blur-xl xl:px-8">

                        {/* BUSCADOR */}

                        <div className="relative hidden md:block">

                            <Search
                                size={17}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder="Buscar en ContaCore..."
                                className="w-[300px] rounded-xl border border-slate-800 bg-[#0a1528] py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                            />

                        </div>

                        {/* USUARIO */}

                        <div className="ml-auto flex items-center gap-4">

                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#0a1528] text-slate-400"
                            >
                                <Bell size={18} />
                            </button>

                            <div className="h-8 w-px bg-slate-800" />

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">

                                    {user?.email
                                            ?.charAt(0)
                                            .toUpperCase() ??
                                        'U'}

                                </div>

                                <div className="hidden sm:block">

                                    <p className="max-w-[180px] truncate text-sm font-semibold">

                                        {user?.email ??
                                            'Usuario'}

                                    </p>

                                    <p className="text-xs text-blue-400">
                                        {primaryRole}
                                    </p>

                                </div>

                                <ChevronDown
                                    size={16}
                                    className="text-slate-500"
                                />

                            </div>

                        </div>

                    </header>

                    {/* AQUÍ SE MUESTRAN LAS PÁGINAS */}

                    <div className="min-w-0 flex-1 overflow-y-auto">

                        <Outlet />

                    </div>

                </div>

            </div>

        </main>
    )
}

export default AppLayout