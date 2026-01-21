/**
 * Format a number as Kenya Shillings (Ksh.)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatKES = (amount) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `Ksh. ${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

/**
 * Format a number as KES (short form)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrencyShort = (amount) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `KES ${value.toLocaleString()}`;
};
