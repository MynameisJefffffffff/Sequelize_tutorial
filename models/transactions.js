module.exports = function (sequelize, DataTypes) {
    const transaction_logs = sequelize.define(
		'transaction_logs',
		{
            id: {
                allowNull        : false,
                autoIncrement    : true,
                primaryKey       : true,
                type             : DataTypes.INTEGER,
            },
            transaction_id       : DataTypes.STRING,
            username             : DataTypes.STRING,
            tran_type            : DataTypes.STRING,
            amount               : DataTypes.DOUBLE,
            before_balance       : DataTypes.DOUBLE,
            after_balance        : DataTypes.DOUBLE,
            remark               : DataTypes.TEXT,
            createdAt: {
                field            : 'created_at',
                type             : DataTypes.DATE,
            },
            updatedAt: {
                field            : 'updated_at',
                type             : DataTypes.DATE,
            },
            deleted_at           : DataTypes.DATE,
		},
		{
			tableName: 'transaction_logs',
		}
	);

	return transaction_logs;
};
