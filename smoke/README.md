# Veil — Smoke Tests

Validan que Arkiv SDK + tlock-js funcionan en Braga testnet ANTES de invertir 36h.

## Setup

```bash
cd smoke
bun install
```

## Orden de ejecución

### 1. Generar wallet y pedir fondos al faucet

```bash
bun run wallet
```

Imprime una address. Cópiala, ve a https://braga.hoodi.arkiv.network/faucet/, pega y pide fondos. Espera ~30s.

### 2. Smoke Arkiv SDK (necesita fondos)

```bash
bun run arkiv
```

Crea → lee → query → borra una entity en Braga. Si pasa, el SDK funciona.

### 3. Smoke tlock-js + drand (sin red Arkiv)

```bash
bun run tlock
```

Encripta un mensaje contra round drand +60s, espera, descifra. Si pasa, tlock funciona.

### 4. Smoke combinado: Arkiv + tlock

```bash
bun run combined
```

Encripta payload con tlock, lo guarda como entity en Arkiv, espera ~65s, lee, descifra. **Si pasa los 3, Veil es viable.** Si falla → pivot a B (Sealed Bids).

## Si falla algo

| Falla                        | Causa probable                   | Fix                                                     |
| ---------------------------- | -------------------------------- | ------------------------------------------------------- |
| `no funds` en `arkiv`        | Faucet pendiente / wrong address | Esperar más, verificar address en `bun run wallet`      |
| `module not found tlock-js`  | tlock-js no instala              | `bun install tlock-js@0.9.0` con pin exacto             |
| tlock mismatch drand version | Conocido en issue #50            | Pinnear drand-client a la versión que esperaba tlock-js |
| Arkiv SDK RPC timeout        | Red Braga lenta                  | Reintentar; si persiste, ver status en Discord Arkiv    |
