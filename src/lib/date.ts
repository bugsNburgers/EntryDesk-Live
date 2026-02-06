export function excelSerialToIsoDate(serial: number): string | null {
    if (!Number.isFinite(serial)) return null

    // Excel typically stores dates as days since 1899-12-30 (with the 1900 leap-year bug baked in).
    // We only care about the date part.
    const days = Math.floor(serial)
    if (days < 1 || days > 60000) return null

    const excelEpochUtcMs = Date.UTC(1899, 11, 30)
    const dateUtc = new Date(excelEpochUtcMs + days * 86400000)
    return dateUtc.toISOString().slice(0, 10)
}

function pad2(n: number) {
    return String(n).padStart(2, '0')
}

function ymd(y: number, m: number, d: number): string | null {
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
    if (y < 1900 || y > 2100) return null
    if (m < 1 || m > 12) return null
    if (d < 1 || d > 31) return null
    return `${y}-${pad2(m)}-${pad2(d)}`
}

/**
 * Best-effort normalization to ISO date (YYYY-MM-DD).
 * Accepts:
 * - ISO date strings
 * - Excel serial numbers (number or numeric string)
 * - Date objects
 * - DD/MM/YYYY or DD-MM-YYYY (common in IN)
 */
export function normalizeDobToIso(value: unknown): string | null {
    if (value == null) return null

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return null
        return value.toISOString().slice(0, 10)
    }

    if (typeof value === 'number') {
        return excelSerialToIsoDate(value)
    }

    const str = String(value).trim()
    if (!str) return null

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

    // Numeric string? Often Excel serial like 39291
    if (/^\d+(?:\.\d+)?$/.test(str)) {
        const asNum = Number(str)
        const iso = excelSerialToIsoDate(asNum)
        if (iso) return iso
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const m = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
    if (m) {
        const day = Number(m[1])
        const month = Number(m[2])
        const year = Number(m[3])
        return ymd(year, month, day)
    }

    return null
}
