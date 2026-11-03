import {
    ArrowLeft,
    Building2,
    FileText,
    Mail,
    MapPin,
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
    getSuppliers,
    type Supplier,
} from '../services/supplierService'

function SupplierDetailPage() {
    const navigate =
        useNavigate()

    const {
        supplierId,
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
        supplier,
        setSupplier,
    ] =
        useState<Supplier | null>(
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

    useEffect(() => {
        const loadSupplier =
            async () => {
                try {
                    setLoading(true)
                    setError('')

                    if (!supplierId) {
                        setError(
                            'No se encontró el identificador del proveedor.',
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

                    const suppliers =
                        await getSuppliers(
                            selectedEntity.id,
                        )

                    const selectedSupplier =
                        suppliers.find(
                            (item) =>
                                item.id === supplierId,
                        )

                    if (!selectedSupplier) {
                        setError(
                            'El proveedor no fue encontrado.',
                        )

                        return
                    }

                    setSupplier(
                        selectedSupplier,
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando proveedor:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar la información del proveedor.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadSupplier()
    }, [supplierId])

    const getSupplierTypeLabel =
        (
            type: string,
        ) => {
            switch (type) {
                case 'NATURAL_PERSON':
                    return 'Persona natural'

                case 'COMPANY':
                    return 'Empresa'

                default:
                    return type
            }
        }

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando proveedor...
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

                    <p className="text-sm font-semibold text-violet-400">
                        Gestión comercial
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Detalle del proveedor
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Información registrada en ${entity.displayName}.`
                            : 'Información del proveedor.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/proveedores',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Volver a Proveedores

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* PROVEEDOR */}

            {supplier && (
                <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">

                    <div className="space-y-6">

                        {/* INFORMACIÓN PRINCIPAL */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

                                    {supplier.type ===
                                    'COMPANY' ? (
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

                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-400">
                                        Proveedor
                                    </p>

                                    <h3 className="mt-1 text-2xl font-black">
                                        {supplier.displayName}
                                    </h3>

                                </div>

                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-2">

                                {/* TIPO */}

                                <div className="rounded-xl border border-slate-800 bg-[#0a1528] p-5">

                                    <p className="text-xs text-slate-500">
                                        Tipo de proveedor
                                    </p>

                                    <p className="mt-2 font-semibold">

                                        {
                                            getSupplierTypeLabel(
                                                supplier.type,
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

                                        {supplier.taxIdentifier ||
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
                                Datos registrados del proveedor.
                            </p>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                {/* CORREO */}

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

                                        {supplier.email ||
                                            'Sin correo registrado'}

                                    </p>

                                </div>

                                {/* TELÉFONO */}

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

                                        {supplier.phone ||
                                            'Sin teléfono registrado'}

                                    </p>

                                </div>

                                {/* DIRECCIÓN */}

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

                                        {supplier.address ||
                                            'Sin dirección registrada'}

                                    </p>

                                </div>

                            </div>

                        </article>

                    </div>

                    {/* RESUMEN */}

                    <aside>

                        <article className="rounded-2xl border border-violet-400/20 bg-[#071329] p-6">

                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
                                Resumen
                            </p>

                            <h3 className="mt-2 text-xl font-black">
                                Estado del proveedor
                            </h3>

                            <div className="mt-6">

                                <p className="text-xs text-slate-500">
                                    Estado
                                </p>

                                {supplier.active ? (
                                    <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Activo
                  </span>
                                ) : (
                                    <span className="mt-2 inline-flex rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                    Inactivo
                  </span>
                                )}

                            </div>

                        </article>

                    </aside>

                </div>
            )}

        </section>
    )
}

export default SupplierDetailPage