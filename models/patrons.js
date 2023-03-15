module.exports = function (sequelize, DataTypes) {
    const patrons = sequelize.define(
		'patrons',
		{
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username     : DataTypes.STRING,
            password     : DataTypes.STRING,
            salt         : DataTypes.STRING,
            access_token : DataTypes.TEXT,
            currency     : DataTypes.STRING,
            remark       : DataTypes.TEXT,
            createdAt    : {
                field: 'created_at',
                type: DataTypes.DATE,
            },
            updatedAt    : {
                field: 'updated_at',
                type: DataTypes.DATE,
            },
            deleted_at   : DataTypes.DATE,
		},
		{
			tableName: 'patrons',
		}
	);

	return patrons;
};
