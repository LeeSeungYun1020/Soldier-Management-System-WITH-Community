const sequelize = require('../config/database');

test('database connection test', done => {
	sequelize
		.authenticate()
		.then(() => {
			console.log("Connection has been established successfully");
			return done();
		})
		.catch(err => {
			return done(err);
		});
});
