import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { login } from '../services/authService'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()

        setError('')
        setSuccess(false)
        setLoading(true)

        try {
            const response = await login({
                email,
                password,
            })

            localStorage.setItem(
                'accessToken',
                response.accessToken,
            )

            setSuccess(true)
        } catch (exception) {
            if (axios.isAxiosError(exception)) {
                if (exception.response?.status === 401) {
                    setError(
                        'El correo electrónico o la contraseña son incorrectos.',
                    )
                } else {
                    setError(
                        'No fue posible iniciar sesión. Inténtalo nuevamente.',
                    )
                }
            } else {
                setError(
                    'Ocurrió un error inesperado.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="grid min-h-screen lg:grid-cols-2">
                <section className="hidden border-r border-slate-800 bg-slate-900/40 p-12 lg:flex lg:flex-col lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                                C
                            </div>

                            <div>
                                <h1 className="text-xl font-bold">
                                    ContaCore
                                </h1>

                                <p className="text-sm text-slate-400">
                                    Gestión contable inteligente
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
                            Control financiero
                        </p>

                        <h2 className="text-4xl font-bold leading-tight">
                            Toda tu información contable en un solo lugar.
                        </h2>

                        <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
                            Administra ingresos, gastos, cuentas por cobrar,
                            cuentas por pagar y reportes financieros desde una
                            plataforma segura y organizada.
                        </p>

                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-2xl font-bold text-blue-400">
                                    100%
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Control contable
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                                <p className="text-2xl font-bold text-blue-400">
                                    Seguro
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Acceso protegido
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500">
                        ContaCore · Sistema de gestión contable
                    </p>
                </section>

                <section className="flex items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-md">
                        <div className="mb-10 lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 font-bold">
                                    C
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold">
                                        ContaCore
                                    </h1>

                                    <p className="text-sm text-slate-400">
                                        Gestión contable
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-semibold text-blue-400">
                                Bienvenido
                            </p>

                            <h2 className="mt-2 text-3xl font-bold tracking-tight">
                                Inicia sesión en ContaCore
                            </h2>

                            <p className="mt-3 text-slate-400">
                                Ingresa tus credenciales para acceder a tu
                                información contable.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Correo electrónico
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="correo@ejemplo.com"
                                    required
                                    disabled={loading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Contraseña
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Ingresa tu contraseña"
                                        required
                                        disabled={loading}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-24 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword,
                                            )
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 transition hover:text-white"
                                    >
                                        {showPassword
                                            ? 'Ocultar'
                                            : 'Mostrar'}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                                    Inicio de sesión correcto.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? 'Iniciando sesión...'
                                    : 'Iniciar sesión'}
                            </button>
                        </form>

                        <div className="mt-8 border-t border-slate-800 pt-6">
                            <p className="text-center text-sm text-slate-500">
                                Acceso protegido mediante autenticación segura
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default LoginPage