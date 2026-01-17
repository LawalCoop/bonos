// Formateo consistente de números para evitar errores de hidratación
// Siempre usa locale es-AR para consistencia entre servidor y cliente

export function formatCurrency(value: number): string {
  return value.toLocaleString("es-AR");
}

export function formatNumber(value: number): string {
  return value.toLocaleString("es-AR");
}
