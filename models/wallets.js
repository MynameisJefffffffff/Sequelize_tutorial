module.exports = function (sequelize, DataTypes) {
    const wallets = sequelize.define(
		'wallets',
		{
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            balance      : DataTypes.FLOAT,
            patronId:{
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                foreignKey: true,
            },
            createdAt    : {
                field: 'created_at',
                type: DataTypes.DATE,
            },
            updatedAt    : {
                field: 'updated_at',
                type: DataTypes.DATE,
            }
		},
		{
			tableName: 'wallets',
		}
	);

	return wallets;
};
