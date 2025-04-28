import {TimeOfDay} from "./utilities.js";
import {AbstractClassInstantiationError, AddressError} from "./errors.js";
import {Address, Email, PhoneNumber} from "./Address.js";

test('timeOfDay test', function () {
    const openingTime = new TimeOfDay(8, 0);
    const closingTime = new TimeOfDay(22, 0);
    expect(openingTime.toString()).toBe("8:00");
    expect(closingTime.toString()).toBe("22:00");
    const time3 = new TimeOfDay(8, 2);
    expect(time3.toString()).toBe("8:02");
})


describe('address tests', function () {
    test ('abstract Address test', function () {
        expect(function () {new Address("a")}).toThrow(AbstractClassInstantiationError);
    })

    test ('email creation test', function () {
        expect(Address.create("khamidullin.bogdan@gmail.com")).toBeInstanceOf(Email);
    })

    test ('phone creation test', function () {
        expect(Address.create("+79171238412")).toBeInstanceOf(PhoneNumber);
    })
    test ('+89171238412 phone creation', function () {
        expect(function() {Address.create("+89171238412")}).toThrow(AddressError);
    })
})