export const formatCurrency = (v) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(v ?? 0);
