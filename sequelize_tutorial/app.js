const m  = require('./models');

async function createNewPatron() {
  const newPatron = await m.patrons.create({
    username: 'John Doe',
    remark: 'john.doe@example.com',
  });

  console.log('New patron created:', newPatron.toJSON());
}

createNewPatron();
