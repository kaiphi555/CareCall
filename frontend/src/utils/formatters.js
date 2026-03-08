/**
 * Formats a string into a standard phone number format: 123-456-7890
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  // Strip all non-numeric characters
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Format as 123-456-7890 if we have 10 digits
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  // Fallback if not 10 digits (e.g. 11 digits with country code)
  const match11 = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match11) {
    return `+${match11[1]}-${match11[2]}-${match11[3]}-${match11[4]}`;
  }

  // If already formatted or other format, just return cleaned with some dashes
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }

  return phone;
}
