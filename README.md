# ContaCore

Sistema backend de gestión contable desarrollado con Java y Spring Boot, orientado a centralizar operaciones contables y financieras mediante una arquitectura modular y una API REST segura.

ContaCore permite administrar entidades contables, planes de cuentas, clientes, proveedores, ingresos, gastos, obligaciones, asientos contables y reportes financieros, manteniendo consistencia mediante el principio de partida doble.

## Estado del proyecto

**Backend V1**

El backend incluye actualmente:

- Autenticación mediante JWT.
- Autorización basada en roles.
- Gestión de entidades contables.
- Plan de cuentas.
- Clientes.
- Proveedores.
- Ingresos.
- Gastos.
- Cuentas por cobrar.
- Cuentas por pagar.
- Registro de pagos de obligaciones.
- Asientos contables.
- Partida doble.
- Libro Diario.
- Libro Mayor.
- Balance de Comprobación.
- Estado de Resultados.
- Balance General.
- Dashboard financiero.
- Validaciones.
- Manejo global de errores.
- Migraciones de base de datos con Flyway.

---

## Tecnologías

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Spring Security
- OAuth2 Resource Server
- JWT
- Jakarta Validation
- Maven

### Base de datos

- PostgreSQL
- Flyway

### Otras herramientas

- Git
- GitHub
- IntelliJ IDEA
- Lombok

---

## Arquitectura

El proyecto sigue una organización modular por dominio.

```text
src/main/java/io/github/edwinbelduma/contacore
│
├── accounting
│   ├── account
│   ├── journal
│   └── report
│
├── accountingentity
├── auth
├── customer
├── dashboard
├── exception
├── expense
├── income
├── obligation
├── security
├── shared
├── supplier
└── user
```

Cada módulo mantiene responsabilidades separadas mediante componentes como:

```text
controller
service
repository
domain
dto
```

---

# Módulos principales

## Autenticación y seguridad

ContaCore utiliza JWT para proteger la API.

Endpoints principales:

```http
POST /api/auth/login
GET  /api/auth/me
```

La aplicación trabaja con sesiones stateless y las rutas protegidas requieren un token válido.

### Roles

Actualmente se contemplan los siguientes roles:

```text
ADMIN
ACCOUNTANT
ASSISTANT
MANAGER
AUDITOR
```

Los permisos se controlan mediante Spring Security y autorización por roles.

---

## Entidades contables

Permite gestionar las entidades sobre las cuales se llevan los registros contables.

Tipos disponibles:

```text
NATURAL_PERSON
INDEPENDENT_PROFESSIONAL
ENTREPRENEURSHIP
SME
```

Ruta principal:

```http
/api/accounting-entities
```

---

## Plan de cuentas

Cada entidad contable puede disponer de su propio plan de cuentas.

Tipos de cuenta:

```text
ASSET
LIABILITY
EQUITY
INCOME
EXPENSE
```

Naturaleza contable:

```text
DEBIT
CREDIT
```

El sistema permite crear estructuras jerárquicas de cuentas mediante cuentas padre e hijas.

Ejemplo:

```text
1 ACTIVO
└── 1.1 ACTIVO CORRIENTE
    ├── 1.1.01 CAJA
    └── 1.1.02 CUENTAS POR COBRAR

2 PASIVO
└── 2.1 CUENTAS POR PAGAR

3 PATRIMONIO
└── 3.1 CAPITAL

4 INGRESOS
└── 4.1 INGRESOS POR SERVICIOS

5 GASTOS
└── 5.1 GASTOS DE OFICINA
```

---

## Asientos contables

ContaCore implementa contabilidad por partida doble.

Cada asiento debe cumplir:

```text
Total Debe = Total Haber
```

Estados soportados:

```text
DRAFT
POSTED
VOIDED
```

Los reportes contables consideran únicamente los asientos válidos en estado:

```text
POSTED
```

---

## Ingresos

Permite registrar ingresos y posteriormente contabilizarlos.

Al contabilizar un ingreso se genera automáticamente un asiento:

```text
DEBE   Cuenta de recepción
HABER  Cuenta de ingresos
```

También es posible anular movimientos contabilizados conservando la trazabilidad contable.

---

## Gastos

Permite registrar y contabilizar gastos.

Al contabilizar un gasto se genera automáticamente:

```text
DEBE   Cuenta de gasto
HABER  Cuenta de pago
```

---

## Obligaciones

ContaCore soporta:

```text
RECEIVABLE
PAYABLE
```

### Cuentas por cobrar

El reconocimiento inicial genera:

```text
DEBE   Cuentas por cobrar
HABER  Ingreso
```

Cuando se registra el cobro:

```text
DEBE   Caja / Banco
HABER  Cuentas por cobrar
```

### Cuentas por pagar

El reconocimiento inicial genera:

```text
DEBE   Gasto o activo correspondiente
HABER  Cuentas por pagar
```

Cuando se registra el pago:

```text
DEBE   Cuentas por pagar
HABER  Caja / Banco
```

Estados de las obligaciones:

```text
PENDING
PARTIALLY_PAID
PAID
OVERDUE
VOIDED
```

---

# Reportes contables

ContaCore genera reportes utilizando los asientos contables en estado `POSTED`.

## Libro Diario

```http
GET /api/accounting-entities/{entityId}/reports/journal
```

Permite consultar los movimientos contables dentro de un rango de fechas.

---

## Libro Mayor

```http
GET /api/accounting-entities/{entityId}/reports/ledger/{accountId}
```

Permite consultar los movimientos y saldo de una cuenta específica.

---

## Balance de Comprobación

```http
GET /api/accounting-entities/{entityId}/reports/trial-balance
```

Permite comprobar la igualdad:

```text
Total Debe = Total Haber
```

---

## Estado de Resultados

```http
GET /api/accounting-entities/{entityId}/reports/income-statement
```

Calcula:

```text
Ingresos
-
Gastos
=
Resultado neto
```

Los valores se obtienen directamente de los asientos contables contabilizados.

---

## Balance General

```http
GET /api/accounting-entities/{entityId}/reports/balance-sheet
```

Permite consultar la situación financiera de la entidad a una fecha determinada.

---

# Dashboard

El backend incluye un resumen financiero disponible mediante:

```http
GET /api/accounting-entities/{entityId}/dashboard/summary
```

Incluye:

```text
totalIncome
totalExpenses
netResult
totalReceivable
totalPayable
overdueObligations
```

Los valores de ingresos, gastos y resultado neto se obtienen desde los asientos contables `POSTED`, manteniendo consistencia con los reportes financieros.

También dispone de:

```http
GET /api/accounting-entities/{entityId}/dashboard/recent-movements
```

para consultar movimientos recientes.

---

# Clientes y proveedores

Cada entidad contable puede administrar sus propios:

- Clientes.
- Proveedores.

Los registros utilizan desactivación lógica para conservar referencias históricas.

---

# Manejo de errores

La API utiliza un manejador global de excepciones.

Las respuestas de error siguen una estructura similar a:

```json
{
  "timestamp": "2026-10-19T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Descripción del error",
  "path": "/api/..."
}
```

Los errores internos inesperados se registran en el servidor sin exponer información sensible al cliente.

---

# Base de datos y migraciones

ContaCore utiliza PostgreSQL.

La estructura de la base de datos se administra mediante Flyway.

Las migraciones se encuentran en:

```text
src/main/resources/db/migration
```

Flyway aplica automáticamente las migraciones pendientes al iniciar la aplicación.

---

# Configuración local

## Requisitos

Para ejecutar el backend se necesita:

```text
Java 21
PostgreSQL
Git
```

El proyecto incluye Maven Wrapper, por lo que no es obligatorio instalar Maven globalmente.

---

## Base de datos

Crear una base de datos PostgreSQL:

```text
contacore_db
```

La configuración principal utiliza:

```text
jdbc:postgresql://localhost:5432/contacore_db
```

Las credenciales y secretos no deben almacenarse directamente en el repositorio.

---

## Variables de entorno

Antes de iniciar la aplicación deben configurarse:

```text
DB_PASSWORD
JWT_SECRET
```

Ejemplo en Windows PowerShell:

```powershell
$env:DB_PASSWORD="TU_CONTRASEÑA_POSTGRESQL"
```

Para generar un secreto JWT seguro:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
```

Nunca se deben publicar contraseñas ni secretos JWT en GitHub.

---

# Ejecución

Desde la raíz del proyecto:

```powershell
.\mvnw.cmd spring-boot:run
```

El backend se ejecutará por defecto en:

```text
http://localhost:8080
```

---

# Compilación

Para comprobar el proyecto:

```powershell
.\mvnw.cmd clean compile
```

Una compilación correcta debe finalizar con:

```text
BUILD SUCCESS
```

---

# Seguridad

La aplicación implementa:

- Autenticación JWT.
- Sesiones stateless.
- Protección de endpoints.
- Control de acceso basado en roles.
- Validación de entrada.
- Manejo seguro de errores.
- Variables de entorno para secretos.
- Desactivación lógica de registros relevantes.

Una petición a una ruta protegida sin autenticación devuelve:

```text
401 Unauthorized
```

Los permisos insuficientes producen:

```text
403 Forbidden
```

---

# Principios contables implementados

ContaCore mantiene como regla fundamental:

```text
Total Debe = Total Haber
```

Los módulos operativos generan sus correspondientes movimientos contables, permitiendo que:

```text
Ingresos
Gastos
Obligaciones
Pagos
```

alimenten los mismos registros contables utilizados posteriormente por:

```text
Libro Diario
Libro Mayor
Balance de Comprobación
Estado de Resultados
Balance General
Dashboard
```

Esto permite mantener una única fuente contable para los reportes financieros.

---

# Próxima etapa

Con el backend V1 estabilizado, la siguiente etapa del proyecto contempla el desarrollo de la interfaz web utilizando:

```text
React
TypeScript
Tailwind CSS
```

El frontend consumirá la API REST de ContaCore.

---

## Autor

**Edwin Leonel Belduma Belduma**

Ingeniero de Software

GitHub: `EdwinBelduma`