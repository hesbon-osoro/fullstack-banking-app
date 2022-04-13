export const validateFields = fieldsToValidate => {
	return fieldsToValidate.every(field => Object.values(field)[0] !== '');
};
