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

    /*
     * CARGAR PROVEEDORES
     */

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
                        data,
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

    /*
     * TIPO DE PROVEEDOR
     */

    const getSupplierTypeLabel =
        (
            type: string,
        ) => {
            switch (type) {
                case 'NATURAL_PERSON':
                    return 'Persona natural'

                case 'COMPANY':
                    return 'Empresa'

                case 'PERSON':
                    return 'Persona natural'

                case 'BUSINESS':
                    return 'Empresa'

                default:
                    return type
            }
        }

    /*
     * FILTRO
     */

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

                    const taxIdentifier =
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

                    const type =
                        getSupplierTypeLabel(
                            supplier.type,
                        ).toLowerCase()

                    return (
                        name.includes(term) ||
                        taxIdentifier.includes(
                            term,
                        ) ||
                        email.includes(term) ||
                        phone.includes(term) ||
                        type.includes(term)
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

                    <h2 className="mt-1 text-3xl font-black tracking-tight">
                        Proveedores
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Administra los proveedores de ${entity.displayName}.`
                            : 'Administra tus proveedores.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/proveedores/nuevo',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
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

            {/* TARJETAS */}

            <div className="mt-8 grid gap-4 md:grid-cols-3">

                {/* TOTAL */}

                <article className="rounded-2xl border border-slate-800 bg-[#071329] p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Total proveedores
                    </p>

                    <p className="mt-3 text-3xl font-black">
                        {suppliers.length}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Proveedores registrados
                    </p>

                </article>

                {/* ACTIVOS */}

                <article className="rounded-2xl border border-emerald-400/15 bg-[#071329] p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">
                        Activos
                    </p>

                    <p className="mt-3 text-3xl font-black text-emerald-300">
                        {activeCount}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Disponibles para operaciones
                    </p>

                </article>

                {/* INACTIVOS */}

                <article className="rounded-2xl border border-slate-700 bg-[#071329] p-5">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Inactivos
                    </p>

                    <p className="mt-3 text-3xl font-black text-slate-300">
                        {inactiveCount}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                        Proveedores desactivados
                    </p>

                </article>

            </div>

            {/* TABLA */}

            <article className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-[#071329]">

                {/* BÚSQUEDA */}

                <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h3 className="font-bold">
                            Lista de proveedores
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Consulta la información registrada.
                        </p>

                    </div>

                    <div className="relative w-full sm:w-[320px]">

                        <Search
                            size={17}
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
                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/50"
                        />

                    </div>

                </div>

                {/* TABLA */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[900px]">

                        <thead>

                        <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-[0.1em] text-slate-500">

                            <th className="px-6 py-4 font-semibold">
                                Proveedor
                            </th>

                            <th className="px-6 py-4 font-semibold">
                                Identificación
                            </th>

                            <th className="px-6 py-4 font-semibold">
                                Contacto
                            </th>

                            <th className="px-6 py-4 font-semibold">
                                Tipo
                            </th>

                            <th className="px-6 py-4 font-semibold">
                                Estado
                            </th>

                            <th className="px-6 py-4 text-right font-semibold">
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
                                    className="px-6 py-14 text-center"
                                >

                                    <Building2
                                        size={38}
                                        className="mx-auto text-slate-700"
                                    />

                                    <p className="mt-4 font-semibold text-slate-300">

                                        {search
                                            ? 'No se encontraron proveedores.'
                                            : 'Todavía no existen proveedores registrados.'}

                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">

                                        {search
                                            ? 'Intenta con otro término de búsqueda.'
                                            : 'Registra tu primer proveedor para comenzar.'}

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
                                        className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/20"
                                    >

                                        {/* PROVEEDOR */}

                                        <td className="px-6 py-5">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                                                    <Building2
                                                        size={19}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="font-semibold text-white">
                                                        {
                                                            supplier.displayName
                                                        }
                                                    </p>

                                                    {supplier.address && (
                                                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                                            {
                                                                supplier.address
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        </td>

                                        {/* IDENTIFICACIÓN */}

                                        <td className="px-6 py-5 text-sm text-slate-300">

                                            {supplier.taxIdentifier ||
                                                'Sin identificación'}

                                        </td>

                                        {/* CONTACTO */}

                                        <td className="px-6 py-5">

                                            <div className="space-y-1.5">

                                                {supplier.email ? (
                                                    <div className="flex items-center gap-2 text-sm text-slate-300">

                                                        <Mail
                                                            size={14}
                                                            className="text-slate-500"
                                                        />

                                                        <span className="max-w-[200px] truncate">
                                {
                                    supplier.email
                                }
                              </span>

                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500">
                                                        Sin correo
                                                    </p>
                                                )}

                                                {supplier.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">

                                                        <Phone
                                                            size={13}
                                                        />

                                                        {
                                                            supplier.phone
                                                        }

                                                    </div>
                                                )}

                                            </div>

                                        </td>

                                        {/* TIPO */}

                                        <td className="px-6 py-5">

                        <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">

                          {
                              getSupplierTypeLabel(
                                  supplier.type,
                              )
                          }

                        </span>

                                        </td>

                                        {/* ESTADO */}

                                        <td className="px-6 py-5">

                                            {supplier.active ? (
                                                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Activo
                          </span>
                                            ) : (
                                                <span className="inline-flex rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            Inactivo
                          </span>
                                            )}

                                        </td>

                                        {/* ACCIONES */}

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