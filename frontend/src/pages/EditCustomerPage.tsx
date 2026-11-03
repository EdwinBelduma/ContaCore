import {
    ArrowLeft,
    Building2,
    FileText,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Save,
    UserRound,
} from 'lucide-react'

import {
    type FormEvent,
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
    updateCustomer,
    type CustomerType,
} from '../services/customerService'

function EditCustomerPage() {
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
        type,
        setType,
    ] =
        useState<CustomerType>(
            'NATURAL_PERSON',
        )

    const [
        displayName,
        setDisplayName,
    ] =
        useState('')

    const [
        taxIdentifier,
        setTaxIdentifier,
    ] =
        useState('')

    const [
        email,
        setEmail,
    ] =
        useState('')

    const [
        phone,
        setPhone,
    ] =
        useState('')

    const [
        address,
        setAddress,
    ] =
        useState('')

    const [
        loading,
        setLoading,
    ] =
        useState(true)

    const [
        saving,
        setSaving,
    ] =
        useState(false)

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

                    const customer =
                        await getCustomerById(
                            selectedEntity.id,
                            customerId,
                        )

                    setType(
                        customer.type as CustomerType,
                    )

                    setDisplayName(
                        customer.displayName ?? '',
                    )

                    setTaxIdentifier(
                        customer.taxIdentifier ?? '',
                    )

                    setEmail(
                        customer.email ?? '',
                    )

                    setPhone(
                        customer.phone ?? '',
                    )

                    setAddress(
                        customer.address ?? '',
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
     * GUARDAR CAMBIOS
     */

    const handleSubmit =
        async (
            event: FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault()

            if (
                !entity ||
                !customerId
            ) {
                setError(
                    'No fue posible identificar el cliente.',
                )

                return
            }

            if (
                !displayName.trim()
            ) {
                setError(
                    'Debes ingresar el nombre o razón social del cliente.',
                )

                return
            }

            if (
                email.trim() &&
                !email.includes('@')
            ) {
                setError(
                    'Ingresa un correo electrónico válido.',
                )

                return
            }

            try {
                setSaving(true)
                setError('')

                await updateCustomer(
                    entity.id,
                    customerId,
                    {
                        type,
                        displayName:
                            displayName.trim(),

                        taxIdentifier:
                            taxIdentifier.trim() ||
                            null,

                        email:
                            email.trim() ||
                            null,

                        phone:
                            phone.trim() ||
                            null,

                        address:
                            address.trim() ||
                            null,
                    },
                )

                navigate(
                    `/clientes/${customerId}`,
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error actualizando cliente:',
                    exception,
                )

                setError(
                    'No fue posible actualizar el cliente.',
                )
            } finally {
                setSaving(false)
            }
        }

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                    <LoaderCircle
                        size={42}
                        className="mx-auto animate-spin text-blue-400"
                    />

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
                        Editar cliente
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Actualiza la información del cliente en ${entity.displayName}.`
                            : 'Actualiza la información del cliente.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            customerId
                                ? `/clientes/${customerId}`
                                : '/clientes',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Volver

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]"
            >

                {/* FORMULARIO */}

                <div className="space-y-6">

                    {/* DATOS PRINCIPALES */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                        <div>

                            <h3 className="text-lg font-bold">
                                Información principal
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Datos generales del cliente.
                            </p>

                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            {/* TIPO */}

                            <div>

                                <label
                                    htmlFor="type"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Tipo de cliente
                                </label>

                                <div className="relative">

                                    <Building2
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <select
                                        id="type"
                                        value={type}
                                        onChange={(
                                            event,
                                        ) =>
                                            setType(
                                                event.target
                                                    .value as CustomerType,
                                            )
                                        }
                                        className="w-full appearance-none rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-blue-500/60"
                                    >

                                        <option value="NATURAL_PERSON">
                                            Persona natural
                                        </option>

                                        <option value="COMPANY">
                                            Empresa
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* IDENTIFICACIÓN */}

                            <div>

                                <label
                                    htmlFor="taxIdentifier"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Cédula / RUC
                                </label>

                                <div className="relative">

                                    <FileText
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        id="taxIdentifier"
                                        type="text"
                                        value={taxIdentifier}
                                        onChange={(
                                            event,
                                        ) =>
                                            setTaxIdentifier(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. 0702743550"
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                                    />

                                </div>

                            </div>

                            {/* NOMBRE */}

                            <div className="md:col-span-2">

                                <label
                                    htmlFor="displayName"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Nombre o razón social
                                    <span className="ml-1 text-rose-400">
                    *
                  </span>
                                </label>

                                <div className="relative">

                                    <UserRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        id="displayName"
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(
                                            event,
                                        ) =>
                                            setDisplayName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Nombre completo o razón social"
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                                    />

                                </div>

                            </div>

                        </div>

                    </article>

                    {/* CONTACTO */}

                    <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                        <div>

                            <h3 className="text-lg font-bold">
                                Información de contacto
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Estos datos son opcionales.
                            </p>

                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">

                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Correo electrónico
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(
                                            event,
                                        ) =>
                                            setEmail(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="correo@ejemplo.com"
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                                    />

                                </div>

                            </div>

                            {/* TELÉFONO */}

                            <div>

                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Teléfono
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    />

                                    <input
                                        id="phone"
                                        type="text"
                                        value={phone}
                                        onChange={(
                                            event,
                                        ) =>
                                            setPhone(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej. 0999999999"
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                                    />

                                </div>

                            </div>

                            {/* DIRECCIÓN */}

                            <div className="md:col-span-2">

                                <label
                                    htmlFor="address"
                                    className="mb-2 block text-sm font-semibold text-slate-300"
                                >
                                    Dirección
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={18}
                                        className="absolute left-4 top-4 text-blue-400"
                                    />

                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(
                                            event,
                                        ) =>
                                            setAddress(
                                                event.target.value,
                                            )
                                        }
                                        rows={4}
                                        placeholder="Dirección del cliente"
                                        className="w-full resize-none rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60"
                                    />

                                </div>

                            </div>

                        </div>

                    </article>

                </div>

                {/* RESUMEN */}

                <aside>

                    <article className="sticky top-6 rounded-2xl border border-blue-400/20 bg-[#071329] p-6">

                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                            Resumen
                        </p>

                        <h3 className="mt-2 text-xl font-black">
                            Cambios del cliente
                        </h3>

                        <div className="mt-6 space-y-5">

                            <div>

                                <p className="text-xs text-slate-500">
                                    Tipo
                                </p>

                                <p className="mt-1 text-sm font-semibold">

                                    {type ===
                                    'NATURAL_PERSON'
                                        ? 'Persona natural'
                                        : 'Empresa'}

                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-slate-500">
                                    Nombre
                                </p>

                                <p className="mt-1 break-words text-sm font-semibold">

                                    {displayName ||
                                        'Sin nombre'}

                                </p>

                            </div>

                            <div>

                                <p className="text-xs text-slate-500">
                                    Identificación
                                </p>

                                <p className="mt-1 text-sm font-semibold">

                                    {taxIdentifier ||
                                        'Sin identificación'}

                                </p>

                            </div>

                        </div>

                        <div className="mt-8 space-y-3">

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {saving ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save
                                            size={18}
                                        />

                                        Guardar cambios
                                    </>
                                )}

                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                    navigate(
                                        customerId
                                            ? `/clientes/${customerId}`
                                            : '/clientes',
                                    )
                                }
                                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/50 hover:text-white"
                            >
                                Cancelar
                            </button>

                        </div>

                    </article>

                </aside>

            </form>

        </section>
    )
}

export default EditCustomerPage
