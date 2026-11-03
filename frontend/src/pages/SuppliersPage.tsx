import {
    Building2,
    Mail,
    Phone,
    Plus,
    Search,
} from 'lucide-react'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    getSuppliers,
    type Supplier,
} from '../services/supplierService'

function SuppliersPage() {
    const navigate =
        useNavigate()

    const [
        entity,
        setEntity,
    ] =
        useState<AccountingEntity | null>(
            null,
        )

    const [
        suppliers,
        setSuppliers,
    ] =
        useState<Supplier[]>(
            [],
        )

    const [
        search,
        setSearch,
    ] =
        useState('')

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
        const loadSuppliers =
            async () => {
                try {
                    setLoading(true)
                    setError('')

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

                    const data =
                        await getSuppliers(
                            selectedEntity.id,
                        )

                    setSuppliers(
                        data ?? [],
                    )
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando proveedores:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar los proveedores.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadSuppliers()
    }, [])

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

    const filteredSuppliers =
        useMemo(() => {
            const term =
                search
                    .trim()
                    .toLowerCase()

            if (!term) {
                return suppliers
            }

            return suppliers.filter(
                (supplier) => {
                    const name =
                        supplier.displayName
                            ?.toLowerCase() ??
                        ''

                    const identification =
                        supplier.taxIdentifier
                            ?.toLowerCase() ??
                        ''

                    const email =
                        supplier.email
                            ?.toLowerCase() ??
                        ''

                    const phone =
                        supplier.phone
                            ?.toLowerCase() ??
                        ''

                    return (
                        name.includes(term) ||
                        identification.includes(
                            term,
                        ) ||
                        email.includes(term) ||
                        phone.includes(term)
                    )
                },
            )
        }, [
            suppliers,
            search,
        ])

    const activeCount =
        suppliers.filter(
            (supplier) =>
                supplier.active,
        ).length

    const inactiveCount =
        suppliers.length -
        activeCount

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-400" />

                    <p className="mt-4 text-sm text-slate-400">
                        Cargando proveedores...
                    </p>

                </div>

            </div>
        )
    }

    return (
        <section className="px-6 py-7 xl:px-8">

            {/* CABECERA */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <p className="text-sm font-semibold text-violet-400">
                        Gestión comercial
                    </p>

                    <h2 className="mt-1 text-3xl font-black">
                        Proveedores
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Proveedores registrados en ${entity.displayName}.`
                            : 'Proveedores registrados.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/proveedores/nuevo',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500"
                >

                    <Plus
                        size={18}
                    />

                    Nuevo proveedor

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* RESUMEN */}

            <div className="mt-8 grid gap-5 md:grid-cols-3">

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                    <p className="text-sm text-slate-400">
                        Total proveedores
                    </p>

                    <p className="mt-3 text-3xl font-black">
                        {suppliers.length}
                    </p>

                </article>

                <article className="rounded-2xl border border-emerald-400/20 bg-[#071329] p-6">

                    <p className="text-sm text-slate-400">
                        Activos
                    </p>

                    <p className="mt-3 text-3xl font-black text-emerald-300">
                        {activeCount}
                    </p>

                </article>

                <article className="rounded-2xl border border-slate-700 bg-[#071329] p-6">

                    <p className="text-sm text-slate-400">
                        Inactivos
                    </p>

                    <p className="mt-3 text-3xl font-black">
                        {inactiveCount}
                    </p>

                </article>

            </div>

            {/* LISTADO */}

            <article className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h3 className="text-lg font-bold">
                            Proveedores registrados
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Historial de proveedores de la entidad contable.
                        </p>

                    </div>

                    <div className="relative w-full sm:w-[330px]">

                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(
                                event,
                            ) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Buscar proveedor..."
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[950px]">

                        <thead>

                        <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">

                            <th className="px-6 py-4">
                                Proveedor
                            </th>

                            <th className="px-6 py-4">
                                Identificación
                            </th>

                            <th className="px-6 py-4">
                                Contacto
                            </th>

                            <th className="px-6 py-4">
                                Tipo
                            </th>

                            <th className="px-6 py-4">
                                Estado
                            </th>

                            <th className="px-6 py-4 text-right">
                                Acciones
                            </th>

                        </tr>

                        </thead>

                        <tbody>

                        {filteredSuppliers.length ===
                        0 ? (
                            <tr>

                                <td
                                    colSpan={6}
                                    className="px-6 py-16 text-center"
                                >

                                    <Building2
                                        size={40}
                                        className="mx-auto text-slate-700"
                                    />

                                    <p className="mt-4 font-semibold text-slate-300">
                                        No hay proveedores para mostrar.
                                    </p>

                                </td>

                            </tr>
                        ) : (
                            filteredSuppliers.map(
                                (
                                    supplier,
                                ) => (
                                    <tr
                                        key={
                                            supplier.id
                                        }
                                        className="border-b border-slate-800/70 last:border-0"
                                    >

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                                                    <Building2
                                                        size={20}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-white">
                                                        {
                                                            supplier.displayName
                                                        }
                                                    </p>

                                                    {supplier.address && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {
                                                                supplier.address
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {supplier.taxIdentifier ||
                                                'Sin identificación'}

                                        </td>

                                        <td className="px-6 py-5">

                                            {supplier.email ? (
                                                <div className="flex items-center gap-2 text-sm text-slate-300">

                                                    <Mail
                                                        size={15}
                                                        className="text-slate-500"
                                                    />

                                                    {
                                                        supplier.email
                                                    }

                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500">
                                                    Sin correo
                                                </p>
                                            )}

                                            {supplier.phone && (
                                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">

                                                    <Phone
                                                        size={14}
                                                    />

                                                    {
                                                        supplier.phone
                                                    }

                                                </div>
                                            )}

                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {
                                                getSupplierTypeLabel(
                                                    supplier.type,
                                                )
                                            }

                                        </td>

                                        <td className="px-6 py-5">

                                            {supplier.active ? (
                                                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Activo
                          </span>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Inactivo
                          </span>
                                            )}

                                        </td>

                                        <td className="px-6 py-5 text-right">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/proveedores/${supplier.id}`,
                                                    )
                                                }
                                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                                            >
                                                Ver detalle
                                            </button>

                                        </td>

                                    </tr>
                                ),
                            )
                        )}

                        </tbody>

                    </table>

                </div>

            </article>

        </section>
    )
}

export default SuppliersPage