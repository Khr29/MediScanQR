/**
 * Validate email address format
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Validate password requirements (minimum 6 characters)
 */
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate doctor registration details
 */
export const validateDoctorForm = (formData) => {
  const errors = {};
  if (!formData.name?.trim()) errors.name = 'Full name is required';
  if (!validateEmail(formData.email)) errors.email = 'Valid email is required';
  if (!validatePassword(formData.password)) errors.password = 'Password must be at least 6 characters';
  if (!formData.licenseNumber?.trim()) errors.licenseNumber = 'Medical License number is required';
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};