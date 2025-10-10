/* eslint-disable linebreak-style */
export const formatValidationErrors = errors => {
  if (!errors || !errors.issues) return 'validation failed';

  if (Array.isArray(errors.issues))
    return errors.issues.map(issue => issue.message).join(', ');
};
