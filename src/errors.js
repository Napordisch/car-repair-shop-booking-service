export class AddressError extends Error {
    constructor(message) {
        super(message);
        this.name = "AddressError";
    }
}

export class MissingDataError extends Error {
    constructor(message) {
        super(message);
        this.name = "MissingDataError";
    }
}

export class impossibleDataBaseConditionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ImpossibleDataBaseConditionError";
    }
}

export class AbstractClassInstantiationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AbstractClassInstantiationError";
    }
}

export class NoUsersFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NoUsersFoundError";
    }
}