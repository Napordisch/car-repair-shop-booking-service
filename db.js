import { v4 as uuidv4 } from 'uuid';
console.log(uuidv4());

import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/db.sqlite',
});

const item = {
    id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        allowNull: false,
        primaryKey: true,
    }
}

const Person = {
    ...item,
    firstName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    phoneNumber: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}

const Customer = sequelize.define('Customer', {
    ...Person
});


const Order = sequelize.define('Order', {
    ...item,
});

const Employee = sequelize.define('Employee', {
    ...Person
});

const Service = sequelize.define('Service', {
    ...item,
    // price in the smallest currency unit: copecks, cents...
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        allowNull: false,
        type: DataTypes.TEXT,
    },
    description: {
        allowNull: true,
        type: DataTypes.TEXT,
    }
});

const Job = sequelize.define('Job', {
    ...item,
    serviceID: {
        allowNull: false,
        type: DataTypes.TEXT,
    }
});


sequelize.sync()
  .then(() => {
    console.log('Database & tables created!');
})
  .catch((err) => {
    console.error('Error creating database tables:', err);
});
