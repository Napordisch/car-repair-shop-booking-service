import {v4 as uuidv4} from 'uuid';
import {DataTypes, Error, Sequelize} from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/db.sqlite',
});

const item = {
    id: {type: DataTypes.UUID, defaultValue: uuidv4, allowNull: false, primaryKey: true,}
}

const Person = {
    ...item,
    firstName: {type: DataTypes.TEXT, allowNull: false,},
    lastName: {type: DataTypes.TEXT, allowNull: true,},
    phoneNumber: {type: DataTypes.TEXT, allowNull: false, unique: true},
    email: {type: DataTypes.TEXT, allowNull: true,}
}

const Customer = sequelize.define('Customer', {
    ...Person,
    phoneNumber: {type: DataTypes.TEXT, allowNull: false, unique: true}
});

const Service = sequelize.define('Service', {
    ...item,
    price: {type: DataTypes.INTEGER, allowNull: false,}, // price in the smallest currency unit: copecks, cents...
    name: {allowNull: false, type: DataTypes.TEXT, unique: true},
    description: {allowNull: true, type: DataTypes.TEXT,}
});


const Order = sequelize.define('Order', {
    ...item,
    deadline: {
        allowNull: false, type: DataTypes.DATE,
    },

    initialVisit: {allowNull: false, type: DataTypes.DATE,},
})

const ParkingSpace = sequelize.define('ParkingSpace', {
    number: {
        type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
    },
    registrationNumber: {type: DataTypes.TEXT, allowNull: false,},
    occupied: {allowNull: false, type: DataTypes.BOOLEAN, defaultValue: false,},

    orderID: {type: DataTypes.UUID, allowNull: false,}
})

sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((err) => {
        console.error('Error creating database tables:', err);
    });

async function registerCustomer(phoneNumber, firstName, lastName, email) {
    if (phoneNumber === undefined) {
        throw new Error("no-phone-number")
    }
    if (firstName === undefined) {
        throw new Error("no-first-name")
    }
    let newCustomer = Customer.build({
        phoneNumber: phoneNumber,
        firstName: firstName
    });

    if (!lastName === undefined) {
        newCustomer.lastName = lastName;
    }

    if (!firstName === undefined) {
        newCustomer.firstName = firstName;
    }
    await newCustomer.save();
}

async function getCustomerId(phoneNumber) {
    const foundCustomer = await Customer.findOne({
        where: {phoneNumber: phoneNumber},
    })

    if (foundCustomer === null) {
        return null;
    }
    return foundCustomer.id;
}

async function addService(price, name, description) {
    await Service.create({
        price: price,
        name: name,
        description: description
    })
}

async function removeService(id) {
    await Service.destroy({
        where: {id: id}
    })
}

async function allServices() {
    return await Service.findAll();
}

export {registerCustomer, getCustomerId, addService, allServices, removeService};