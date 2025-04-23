class AddressError extends Error {
    constructor(message) {
        super(message);
        this.name = "AddressError";
    }
}

class MissingDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "MissingDataError";
    }
}

class impossibleDataBaseConditionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ImpossibleDataBaseConditionError";
    }
}
export { AddressError, MissingDataError, impossibleDataBaseConditionError };