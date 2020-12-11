import ValidationError from "./../validationError";

const throwError = () => {
    throw new ValidationError("Value is required.");
};

export default (value: any) => {
    if (value === null || value === undefined) {
        throwError();
    }
};
