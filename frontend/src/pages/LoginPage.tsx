import {
    useState,
    type FormEvent,
    type MouseEvent,
} from 'react'

import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import {
    BarChart3,
    Bell,
    Code2,
    Eye,
    EyeOff,
    FileBarChart,
    HandCoins,
    Home,
    LockKeyhole,
    LogIn,
    Mail,
    ReceiptText,
    Search,
    ShieldCheck,
    TrendingDown,
    TrendingUp,
    WalletCards,
} from 'lucide-react'

import { login } from '../services/authService'

function LoginPage() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] =
        useState(false)

    const [loading, setLoading] =
        useState(false)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState(false)

    const baseRotateX = 1.5
    const baseRotateY = -4
    const baseRotateZ = 0.8

    const handleDashboardMove = (
        event: MouseEvent<HTMLDivElement>,
    ) => {
        const element =
            event.currentTarget

        const rect =
            element.getBoundingClientRect()

        const mouseX =
            event.clientX - rect.left

        const mouseY =
            event.clientY - rect.top

        const centerX =
            rect.width / 2

        const centerY =
            rect.height / 2

        const dynamicRotateY =
            ((mouseX - centerX) / centerX) *
            2.3

        const dynamicRotateX =
            -(
                (mouseY - centerY) /
                centerY
            ) * 1.8

        element.style.transform = `
      perspective(1200px)
      rotateX(${baseRotateX + dynamicRotateX}deg)
      rotateY(${baseRotateY + dynamicRotateY}deg)
      rotateZ(${baseRotateZ}deg)
      translateY(-3px)
      translateX(8px)
      scale(1.01)
    `
    }

    const handleDashboardLeave = (
        event: MouseEvent<HTMLDivElement>,
    ) => {
        event.currentTarget.style.transform = `
      perspective(1200px)
      rotateX(${baseRotateX}deg)
      rotateY(${baseRotateY}deg)
      rotateZ(${baseRotateZ}deg)
      translateY(0px)
      translateX(8px)
      scale(1)
    `
    }

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

            navigate(
                '/dashboard',
                {
                    replace: true,
                },
            )
        } catch (exception) {
            if (
                axios.isAxiosError(exception)
            ) {
                if (
                    exception.response?.status ===
                    401
                ) {
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
        <main className="relative min-h-screen overflow-x-hidden bg-[#020817] text-white xl:h-screen xl:overflow-hidden">

            {/* FONDOS */}

            <div className="pointer-events-none absolute -left-44 -top-44 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />

            <div className="pointer-events-none absolute left-[39%] top-[-330px] h-[750px] w-[750px] rounded-full border border-blue-500/20" />

            <div className="pointer-events-none absolute left-[43%] top-[-270px] h-[640px] w-[640px] rounded-full border border-cyan-400/10" />

            <div className="pointer-events-none absolute -right-40 bottom-[-280px] h-[550px] w-[550px] rounded-full bg-blue-700/10 blur-[120px]" />

            <div className="relative mx-auto grid min-h-screen max-w-[1920px] xl:h-screen xl:min-h-0 xl:grid-cols-[1.08fr_0.92fr]">

                {/* =====================================================
            LADO IZQUIERDO
        ====================================================== */}

                <section className="relative hidden h-screen overflow-hidden px-12 py-6 xl:block 2xl:px-16">

                    {/* LOGO */}

                    <header className="relative z-30 flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-300/30 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-700 text-2xl font-black shadow-[0_0_35px_rgba(37,99,235,0.45)]">
                            C
                        </div>

                        <div>

                            <h1 className="text-2xl font-extrabold tracking-tight">
                                ContaCore
                            </h1>

                            <p className="mt-0.5 text-sm text-blue-200/70">
                                Gestión contable inteligente
                            </p>

                        </div>

                    </header>

                    {/* HERO */}

                    <div className="relative z-30 mt-5">

                        <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-400">
                            Control financiero
                        </div>

                        <h2 className="mt-4 max-w-[780px] text-[clamp(2.55rem,3vw,3.75rem)] font-black leading-[1.04] tracking-tight">

                            Toda tu información

                            <br />

                            contable{' '}

                            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                en un solo lugar.
              </span>

                        </h2>

                        <p className="mt-3 max-w-[735px] text-[15px] leading-6 text-slate-300/80">
                            Administra ingresos, gastos,
                            cuentas por cobrar, cuentas por
                            pagar y reportes financieros
                            desde una plataforma segura y
                            organizada.
                        </p>

                    </div>

                    {/* TARJETAS */}

                    <div className="relative z-30 mt-5 grid max-w-[820px] grid-cols-2 gap-4">

                        <article className="rounded-2xl border border-blue-400/20 bg-[#071329]/90 p-4 shadow-[0_18px_45px_rgba(0,40,120,0.20)] backdrop-blur-xl">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-cyan-400">

                                    <BarChart3
                                        size={23}
                                    />

                                </div>

                                <div>

                                    <p className="text-xl font-extrabold">
                                        100%
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Control contable
                                    </p>

                                </div>

                            </div>

                        </article>

                        <article className="rounded-2xl border border-emerald-400/20 bg-[#071329]/90 p-4 shadow-[0_18px_45px_rgba(0,40,120,0.20)] backdrop-blur-xl">

                            <div className="flex items-center gap-4">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">

                                    <ShieldCheck
                                        size={23}
                                    />

                                </div>

                                <div>

                                    <p className="text-xl font-extrabold">
                                        Seguro
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Acceso protegido
                                    </p>

                                </div>

                            </div>

                        </article>

                    </div>

                    {/* RESPLANDOR */}

                    <div className="pointer-events-none absolute bottom-[35px] left-[65px] z-0 h-[250px] w-[760px] rounded-full bg-blue-600/15 blur-[90px]" />

                    {/* MINI DASHBOARD */}

                    <div className="relative z-10 mt-5 max-w-[850px] pl-2">

                        <div
                            onMouseMove={
                                handleDashboardMove
                            }
                            onMouseLeave={
                                handleDashboardLeave
                            }
                            style={{
                                transform: `
                  perspective(1200px)
                  rotateX(${baseRotateX}deg)
                  rotateY(${baseRotateY}deg)
                  rotateZ(${baseRotateZ}deg)
                  translateY(0px)
                  translateX(8px)
                  scale(1)
                `,
                                transformStyle:
                                    'preserve-3d',
                                transformOrigin:
                                    'center center',
                                willChange:
                                    'transform',
                            }}
                            className="group relative h-[275px] cursor-pointer overflow-hidden rounded-[26px] border border-blue-400/25 bg-[#061126]/95 p-3 shadow-[0_35px_110px_rgba(0,90,255,0.30)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:border-blue-400/45 hover:shadow-[0_45px_130px_rgba(0,115,255,0.38)]"
                        >

                            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-70" />

                            <div className="pointer-events-none absolute -left-[50%] -top-[80%] h-[240%] w-[38%] rotate-[28deg] bg-gradient-to-r from-transparent via-cyan-200/[0.045] to-transparent opacity-0 blur-xl transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100" />

                            <div
                                style={{
                                    transform:
                                        'translateZ(24px)',
                                }}
                                className="relative h-full overflow-hidden rounded-[19px] border border-slate-700/50 bg-[#081226] shadow-2xl"
                            >

                                <div className="grid h-full grid-cols-[170px_1fr]">

                                    {/* SIDEBAR */}

                                    <aside className="border-r border-slate-800/80 bg-[#050e1d] p-3">

                                        <div className="mb-4 flex items-center gap-2">

                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold shadow-lg shadow-blue-600/30">
                                                C
                                            </div>

                                            <span className="text-sm font-semibold">
                        ContaCore
                      </span>

                                        </div>

                                        <nav className="space-y-1 text-[11px]">

                                            <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium shadow-lg shadow-blue-600/20">

                                                <Home size={13} />

                                                Dashboard

                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-400">

                                                <HandCoins
                                                    size={13}
                                                />

                                                Ingresos

                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-400">

                                                <ReceiptText
                                                    size={13}
                                                />

                                                Gastos

                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-400">

                                                <WalletCards
                                                    size={13}
                                                />

                                                Cuentas por cobrar

                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-400">

                                                <WalletCards
                                                    size={13}
                                                />

                                                Cuentas por pagar

                                            </div>

                                            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-400">

                                                <FileBarChart
                                                    size={13}
                                                />

                                                Reportes

                                            </div>

                                        </nav>

                                    </aside>

                                    {/* CONTENIDO */}

                                    <div className="p-4">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <h3 className="text-base font-bold">
                                                    Hola,
                                                </h3>

                                                <p className="mt-0.5 text-[9px] text-slate-500">
                                                    Resumen de tu actividad
                                                    financiera.
                                                </p>

                                            </div>

                                            <div className="flex items-center gap-2">

                                                <div className="hidden items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-[9px] text-slate-500 2xl:flex">

                                                    <Search
                                                        size={12}
                                                    />

                                                    Buscar...

                                                </div>

                                                <Bell
                                                    size={14}
                                                    className="text-slate-400"
                                                />

                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold shadow-lg shadow-blue-500/25">
                                                    C
                                                </div>

                                            </div>

                                        </div>

                                        {/* ESTADÍSTICAS */}

                                        <div className="mt-3 grid grid-cols-3 gap-2">

                                            <div
                                                style={{
                                                    transform:
                                                        'translateZ(14px)',
                                                }}
                                                className="rounded-xl border border-slate-800/60 bg-slate-900/80 p-3"
                                            >

                                                <div className="flex items-center justify-between">

                          <span className="text-[9px] text-slate-400">
                            Ingresos
                          </span>

                                                    <TrendingUp
                                                        size={13}
                                                        className="text-emerald-400"
                                                    />

                                                </div>

                                                <p className="mt-1 text-sm font-bold">
                                                    $12,450
                                                </p>

                                                <p className="text-[9px] text-emerald-400">
                                                    +12%
                                                </p>

                                            </div>

                                            <div
                                                style={{
                                                    transform:
                                                        'translateZ(14px)',
                                                }}
                                                className="rounded-xl border border-slate-800/60 bg-slate-900/80 p-3"
                                            >

                                                <div className="flex items-center justify-between">

                          <span className="text-[9px] text-slate-400">
                            Gastos
                          </span>

                                                    <TrendingDown
                                                        size={13}
                                                        className="text-rose-400"
                                                    />

                                                </div>

                                                <p className="mt-1 text-sm font-bold">
                                                    $4,230
                                                </p>

                                                <p className="text-[9px] text-rose-400">
                                                    -8%
                                                </p>

                                            </div>

                                            <div
                                                style={{
                                                    transform:
                                                        'translateZ(14px)',
                                                }}
                                                className="rounded-xl border border-slate-800/60 bg-slate-900/80 p-3"
                                            >

                                                <div className="flex items-center justify-between">

                          <span className="text-[9px] text-slate-400">
                            Saldo
                          </span>

                                                    <WalletCards
                                                        size={13}
                                                        className="text-blue-400"
                                                    />

                                                </div>

                                                <p className="mt-1 text-sm font-bold">
                                                    $8,220
                                                </p>

                                                <p className="text-[9px] text-emerald-400">
                                                    +15%
                                                </p>

                                            </div>

                                        </div>

                                        {/* GRÁFICO */}

                                        <div
                                            style={{
                                                transform:
                                                    'translateZ(10px)',
                                            }}
                                            className="mt-2 rounded-xl border border-slate-800/50 bg-slate-900/60 p-3"
                                        >

                                            <div className="mb-2 flex items-center justify-between">

                                                <p className="text-[11px] font-semibold">
                                                    Resumen financiero
                                                </p>

                                                <span className="text-[8px] text-slate-500">
                          Últimos 12 meses
                        </span>

                                            </div>

                                            <div className="flex h-[52px] items-end gap-1.5">

                                                {[
                                                    35,
                                                    52,
                                                    42,
                                                    66,
                                                    54,
                                                    40,
                                                    73,
                                                    58,
                                                    83,
                                                    62,
                                                    76,
                                                    65,
                                                ].map(
                                                    (
                                                        height,
                                                        index,
                                                    ) => (
                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="flex-1 rounded-t-md bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.18)]"
                                                            style={{
                                                                height:
                                                                    `${height}%`,
                                                            }}
                                                        />
                                                    ),
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================================
            LADO DERECHO
        ====================================================== */}

                <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 xl:h-screen xl:min-h-0 xl:px-10 xl:py-5">

                    <div className="w-full max-w-[570px]">

                        {/* LOGO MÓVIL */}

                        <div className="mb-6 flex items-center gap-3 xl:hidden">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-700 text-xl font-black shadow-lg shadow-blue-600/20">
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

                        {/* LOGIN */}

                        <div className="relative overflow-hidden rounded-[26px] border border-blue-400/30 bg-[#071329]/85 p-7 shadow-[0_25px_80px_rgba(0,102,255,0.16)] backdrop-blur-2xl">

                            <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                            <div className="relative">

                                <p className="text-sm font-semibold text-cyan-400">
                                    Bienvenido de nuevo
                                </p>

                                <h2 className="mt-2 text-[2rem] font-black tracking-tight">
                                    Inicia sesión en ContaCore
                                </h2>

                                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
                                    Ingresa tus credenciales para
                                    acceder a tu información
                                    contable de forma segura.
                                </p>

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    className="mt-6 space-y-4"
                                >

                                    {/* CORREO */}

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-200"
                                        >
                                            Correo electrónico
                                        </label>

                                        <div className="relative">

                                            <Mail
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
                                            />

                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                value={email}
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setEmail(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="correo@ejemplo.com"
                                                required
                                                disabled={
                                                    loading
                                                }
                                                className="w-full rounded-xl border border-slate-600/80 bg-[#0d1930]/90 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 hover:border-blue-400/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                        </div>

                                    </div>

                                    {/* PASSWORD */}

                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-200"
                                        >
                                            Contraseña
                                        </label>

                                        <div className="relative">

                                            <LockKeyhole
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
                                            />

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                autoComplete="current-password"
                                                value={
                                                    password
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    setPassword(
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                placeholder="Ingresa tu contraseña"
                                                required
                                                disabled={
                                                    loading
                                                }
                                                className="w-full rounded-xl border border-slate-600/80 bg-[#0d1930]/90 py-3.5 pl-12 pr-14 text-white outline-none transition placeholder:text-slate-500 hover:border-blue-400/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-300"
                                                aria-label={
                                                    showPassword
                                                        ? 'Ocultar contraseña'
                                                        : 'Mostrar contraseña'
                                                }
                                            >

                                                {showPassword ? (
                                                    <EyeOff
                                                        size={19}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={19}
                                                    />
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                    {/* ERROR */}

                                    {error && (
                                        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
                                            {error}
                                        </div>
                                    )}

                                    {/* ÉXITO */}

                                    {success && (
                                        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                                            Inicio de sesión correcto.
                                        </div>
                                    )}

                                    {/* BOTÓN */}

                                    <button
                                        type="submit"
                                        disabled={
                                            loading
                                        }
                                        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 px-6 py-3.5 font-bold text-white shadow-[0_15px_40px_rgba(37,99,235,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(37,99,235,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        <LogIn
                                            size={19}
                                            className="transition group-hover:translate-x-0.5"
                                        />

                                        {loading
                                            ? 'Iniciando sesión...'
                                            : 'Iniciar sesión'}

                                    </button>

                                </form>

                                {/* SEGURIDAD */}

                                <div className="my-5 flex items-center gap-4">

                                    <div className="h-px flex-1 bg-slate-700/70" />

                                    <span className="text-[11px] text-slate-500">
                    acceso seguro
                  </span>

                                    <div className="h-px flex-1 bg-slate-700/70" />

                                </div>

                                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">

                                    <ShieldCheck
                                        size={17}
                                        className="text-blue-400"
                                    />

                                    Acceso protegido mediante
                                    autenticación segura

                                </div>

                            </div>

                        </div>

                        {/* FIRMA */}

                        <footer className="mt-4 flex items-center justify-between gap-4 border-t border-slate-800/70 pt-4 text-[11px] text-slate-500">

              <span>
                ContaCore · Gestión contable
                inteligente
              </span>

                            <div className="flex items-center gap-2">

                                <Code2
                                    size={14}
                                    className="text-blue-400"
                                />

                                <span>

                  Desarrollado por{' '}

                                    <span className="font-semibold text-blue-400">
                    Edwin Belduma
                  </span>

                </span>

                            </div>

                        </footer>

                    </div>

                </section>

            </div>

        </main>
    )
}

export default LoginPage