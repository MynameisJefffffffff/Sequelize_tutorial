// migrations/YYYYMMDDHHMMSS-create-wallets.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("wallets", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      balance: Sequelize.FLOAT,
      patronId: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: "patrons",
          key: "id",
        },
      },
      created_at: Sequelize.DATE,
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        )
      },
    });
    await queryInterface.addIndex("wallets", ["patronId"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("wallets");
  },
};
