'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [{
      firstname: 'Super',
      lastname: 'Admin',
      username: 'superadmin',
      password: 'Test@123',
      email: 'rajasekar.s@techmango.net',
      isActive: true,
      isSuperUser: true,
      createdAt : new Date(),
      updatedAt : new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', [{
      username :'superadmin'
    }])
  }
};
