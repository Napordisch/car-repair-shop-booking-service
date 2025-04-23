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
export { AddressError, MissingDataError };