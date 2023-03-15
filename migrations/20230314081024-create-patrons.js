'use strict';

module.exports = {
  	async up (queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		await queryInterface.createTable('patrons', {
			id: {
				allowNull     : false,
				autoIncrement : true,
				primaryKey    : true,
				type          : Sequelize.BIGINT.UNSIGNED,
			},
			username		  : Sequelize.STRING(64),
			password          : Sequelize.STRING(64),
			salt              : Sequelize.STRING(64),
			access_token: {
				type          : Sequelize.TEXT,
				defaultValue  : '',
			},
			currency: {
				type          : Sequelize.STRING(32),
				defaultValue  : 'MYR',
			},
			remark            : Sequelize.TEXT,
			created_at        : Sequelize.DATE,
			updated_at: {
				type          : Sequelize.DATE,
				allowNull     : false,
				defaultValue  : Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
			},
			deleted_at      : Sequelize.DATE,
		}, { charset : 'utf8' })
		.then(() => queryInterface.addIndex('patrons', ['id']))
		.then(() => queryInterface.addIndex('patrons', ['username']))
		.then(() => queryInterface.addIndex('patrons', ['username', 'currency']))
		.then(() => queryInterface.addIndex('patrons', ['currency']))
		.then(() => queryInterface.addIndex('patrons', ['created_at']))
		.then(() => queryInterface.addIndex('patrons', ['updated_at']))
	},

	async down (queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.dropTable('patrons');
	}
};
