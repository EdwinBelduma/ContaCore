import {
    ArrowLeft,
    Building2,
    FileText,
    Mail,
    MapPin,
    Pencil,
    Phone,
    UserRound,
} from 'lucide-react'

import {
    useEffect,
    useState,
} from 'react'

import {
    useNavigate,
    useParams,
} from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getCustomerById,
    type Customer,
} from '../services/customerService'

function CustomerDetailPage() {
    const navigate =
        useNavigate()

    const {
        customerId,
    } =
        useParams()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        customer,
        setCustomer,
    ] =
        useState<Customer | null>(
            null,
        )

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        error,
        setError,
    ] =
        useState('')

    /*
     * CARGAR CLIENTE
     */

    useEffect(() => {
        const loadCustomer =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    if (!customerId) {
                        setError(
                            'No se encontró el identificador del cliente.',
                        )

                        return
                    }

                    const entities =
                        await getAccountingEntities()

                    if (
                        !entities ||
                        entities.length === 0
                    ) {
                        setError(
                            'No existe una entidad contable disponible.',
                        )

                        return
                    }

                    const selectedEntity =
                        entities.find(
                            (item) =>
                                item.active,
                        ) ??
                        entities[0]

                    setEntity(
                        selectedEntity,
                    )

                    const selectedCustomer =
                        await getCustomerById(
                            selectedEntity.id,
                            customerId,
                        )

                    setCustomer(
                        selectedCustomer,
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando cliente:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar la información del cliente.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadCustomer()
    }, [customerId])

    /*
     * TIPO
     */

    const getCustomerTypeLabel =
        (
            type: string,
        ) => {
            switch (type) {
                case 'NATURAL_PERSON':
                case 'INDIVIDUAL':
                    return 'Persona natural'

                case 'COMPANY':
                case 'BUSINESS':
                    return 'Empresa'

                default:
                    return type
            }
        }

    /*
     * CARGANDO
     */

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando cliente...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <p className="text-sm font-semibold text-blue-400">
                        Gestión comercial
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Detalle del cliente
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Información registrada en ${entity.displayName}.`
                            : 'Información del cliente.'}

                    </p>

                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                    {customer && (
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/clientes/${customer.id}/editar`,
                                )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
                        >

                            <Pencil
                                size={17}
                            />

                            Editar cliente

                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/clientes',
                            )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/50 hover:text-white"
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Volver a Clientes

                    </button>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* CLIENTE */}

            {customer && (
                <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">

                    <div className="space-y-6">

                        {/* INFORMACIÓN PRINCIPAL */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                                    {customer.type ===
                                    'COMPANY' ||
                                    customer.type ===
                                    'BUSINESS' ? (
                                        <Building2
                                            size={26}
                                        />
                                    ) : (
                                        <UserRound
                                            size={26}
                                        />
                                    )}

                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
                                        Cliente
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black">
                                        {customer.displayName}
                                    </h3>

                                </div>

                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-2">

                                {/* TIPO */}

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5">

                                    <p className="text-xs text-slate-500">
                                        Tipo de cliente
                                    </p>

                                    <p className="mt-2 font-semibold">

                                        {
                                            getCustomerTypeLabel(
                                                customer.type,
                                            )
                                        }

                                    </p>

                                </div>

                                {/* IDENTIFICACIÓN */}

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5">

                                    <div className="flex items-center gap-2 text-slate-500">

                                        <FileText
                                            size={16}
                                        />

                                        <p className="text-xs">
                                            Cédula / RUC
                                        </p>

                                    </div>

                                    <p className="mt-2 font-semibold">

                                        {customer.taxIdentifier ||
                                            'Sin identificación'}

                                    </p>

                                </div>

                            </div>

                        </article>

                        {/* CONTACTO */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <h3 className="text-lg font-bold">
                                Información de contacto
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Datos registrados del cliente.
                            </p>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5">

                                    <div className="flex items-center gap-2 text-slate-500">

                                        <Mail
                                            size={17}
                                        />

                                        <p className="text-xs">
                                            Correo electrónico
                                        </p>

                                    </div>

                                    <p className="mt-3 break-words text-sm font-semibold">

                                        {customer.email ||
                                            'Sin correo registrado'}

                                    </p>

                                </div>

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5">

                                    <div className="flex items-center gap-2 text-slate-500">

                                        <Phone
                                            size={17}
                                        />

                                        <p className="text-xs">
                                            Teléfono
                                        </p>

                                    </div>

                                    <p className="mt-3 text-sm font-semibold">

                                        {customer.phone ||
                                            'Sin teléfono registrado'}

                                    </p>

                                </div>

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5 md:col-span-2">

                                    <div className="flex items-center gap-2 text-slate-500">

                                        <MapPin
                                            size={17}
                                        />

                                        <p className="text-xs">
                                            Dirección
                                        </p>

                                    </div>

                                    <p className="mt-3 text-sm font-semibold">

                                        {customer.address ||
                                            'Sin dirección registrada'}

                                    </p>

                                </div>

                            </div>

                        </article>

                    </div>

                    {/* RESUMEN */}

                    <aside>

                        <article className="rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                                Resumen
                            </p>

                            <h3 className="mt-2 text-xl font-black">
                                Estado del cliente
                            </h3>

                            <div className="mt-6">

                                <p className="text-xs text-slate-500">
                                    Estado
                                </p>

                                {customer.active ? (
                                    <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Activo
                  </span>
                                ) : (
                                    <span className="mt-2 inline-flex rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                    Inactivo
                  </span>
                                )}

                            </div>

                            <div className="mt-8 border-t border-slate-800 pt-6">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/clientes/${customer.id}/editar`,
                                        )
                                    }
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                                >

                                    <Pencil
                                        size={17}
                                    />

                                    Editar cliente

                                </button>

                            </div>

                        </article>

                    </aside>

                </div>
            )}

        </section>
    )
}

export default CustomerDetailPage