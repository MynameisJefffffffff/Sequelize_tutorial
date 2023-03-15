'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('transaction_logs', {
        id: {
            allowNull        : false,
            autoIncrement    : true,
            primaryKey       : true,
            type             : Sequelize.BIGINT.UNSIGNED,
        },
        transaction_id: {
            unique           : true,
            type             : Sequelize.STRING(64),
        },
        username             : Sequelize.STRING(64),
        tran_type            : Sequelize.STRING(32),
        amount               : Sequelize.DOUBLE,
        before_balance       : Sequelize.DOUBLE,
        after_balance        : Sequelize.DOUBLE,
        remark               : Sequelize.TEXT,
        created_at           : Sequelize.DATE,
        updated_at: {
            type             : Sequelize.DATE,
            allowNull        : false,
            defaultValue     : Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at           : Sequelize.DATE,
    }, { charset : 'utf8' })
    .then(() => queryInterface.addIndex('transaction_logs', ['transaction_id']))
    .then(() => queryInterface.addIndex('transaction_logs', ['username']))
    .then(() => queryInterface.addIndex('transaction_logs', ['created_at']))
    .then(() => queryInterface.addIndex('transaction_logs', ['updated_at']))
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('transaction_logs');

  }
};
