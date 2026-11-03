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
    useEffect,
    useState,
} from 'react'

import type {
    FormEvent,
} from 'react'

import {
    useNavigate,
} from 'react-router-dom'

import {
    getAccountingEntities,
    type AccountingEntity,
} from '../services/accountingEntityService'

import {
    createCustomer,
    type CustomerType,
} from '../services/customerService'

function NewCustomerPage() {
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
     * CARGAR ENTIDAD CONTABLE
     */

    useEffect(() => {
        const loadEntity =
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
                } catch (
                    exception
                    ) {
                    console.error(
                        'Error cargando entidad:',
                        exception,
                    )

                    setError(
                        'No fue posible cargar la entidad contable.',
                    )
                } finally {
                    setLoading(false)
                }
            }

        loadEntity()
    }, [])

    /*
     * GUARDAR CLIENTE
     */

    const handleSubmit =
        async (
            event: FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault()

            if (!entity) {
                setError(
                    'No existe una entidad contable seleccionada.',
                )

                return
            }

            if (
                !displayName.trim()
            ) {
                setError(
                    'Debes ingresar el nombre del cliente.',
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

                await createCustomer(
                    entity.id,
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
                    '/clientes',
                )
            } catch (
                exception
                ) {
                console.error(
                    'Error creando cliente:',
                    exception,
                )

                setError(
                    'No fue posible registrar el cliente. Revisa los datos e inténtalo nuevamente.',
                )
            } finally {
                setSaving(false)
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
                        Cargando formulario...
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
                        Nuevo cliente
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">

                        {entity
                            ? `Registra un nuevo cliente en ${entity.displayName}.`
                            : 'Registra un nuevo cliente.'}

                    </p>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/clientes',
                        )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50 hover:text-white"
                >

                    <ArrowLeft
                        size={17}
                    />

                    Volver a Clientes

                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-300">
                    {error}
                </div>
            )}

            {/* FORMULARIO */}

            <form
                onSubmit={
                    handleSubmit
                }
                className="mt-8"
            >

                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

                    {/* IZQUIERDA */}

                    <div className="space-y-6">

                        {/* INFORMACIÓN PRINCIPAL */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                    <UserRound
                                        size={20}
                                    />

                                </div>

                                <div>

                                    <h3 className="font-bold">
                                        Información del cliente
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Ingresa los datos principales.
                                    </p>

                                </div>

                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                {/* TIPO */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Tipo de cliente
                                    </label>

                                    <select
                                        value={
                                            type
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setType(
                                                event
                                                    .target
                                                    .value as CustomerType,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-800 bg-[#0a1528] px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50"
                                    >

                                        <option value="PERSON">
                                            Persona natural
                                        </option>

                                        <option value="COMPANY">
                                            Empresa
                                        </option>

                                    </select>

                                </div>

                                {/* IDENTIFICACIÓN */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Cédula / RUC

                                        <span className="ml-2 text-xs font-normal text-slate-500">
                      Opcional
                    </span>

                                    </label>

                                    <div className="relative">

                                        <FileText
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                taxIdentifier
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setTaxIdentifier(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Ej. 0701234567"
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                                        />

                                    </div>

                                </div>

                                {/* NOMBRE */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Nombre o razón social
                                    </label>

                                    <div className="relative">

                                        <Building2
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                displayName
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setDisplayName(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Ej. Juan Pérez o Empresa ABC"
                                            required
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                                        />

                                    </div>

                                </div>

                            </div>

                        </article>

                        {/* CONTACTO */}

                        <article className="rounded-2xl border border-slate-800 bg-[#071329] p-6">

                            <h3 className="font-bold">
                                Información de contacto
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Estos datos son opcionales.
                            </p>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">

                                {/* EMAIL */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Correo electrónico
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="email"
                                            value={
                                                email
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setEmail(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="cliente@email.com"
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                                        />

                                    </div>

                                </div>

                                {/* TELÉFONO */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Teléfono
                                    </label>

                                    <div className="relative">

                                        <Phone
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                phone
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setPhone(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Ej. 0999999999"
                                            className="w-full rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                                        />

                                    </div>

                                </div>

                                {/* DIRECCIÓN */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                                        Dirección
                                    </label>

                                    <div className="relative">

                                        <MapPin
                                            size={17}
                                            className="pointer-events-none absolute left-4 top-4 text-slate-500"
                                        />

                                        <textarea
                                            value={
                                                address
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setAddress(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Ej. Machala, El Oro"
                                            rows={3}
                                            className="w-full resize-none rounded-xl border border-slate-800 bg-[#0a1528] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                                        />

                                    </div>

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
                                Nuevo cliente
                            </h3>

                            <div className="mt-6 space-y-4">

                                <div className="border-b border-slate-800 pb-4">

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

                                <div className="border-b border-slate-800 pb-4">

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
                                        Estado inicial
                                    </p>

                                    <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Activo
                  </span>

                                </div>

                            </div>

                        </article>

                    </aside>

                </div>

                {/* BOTONES */}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        disabled={
                            saving
                        }
                        onClick={() =>
                            navigate(
                                '/clientes',
                            )
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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

                                Guardar cliente
                            </>
                        )}

                    </button>

                </div>

            </form>

        </section>
    )
}

export default NewCustomerPage