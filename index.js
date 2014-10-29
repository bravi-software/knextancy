
var knex = require('knex')(require('./knexfile').development);


knex('tenant-1:users').where({
  name: 'Test'
}).select('name').then(function (users) {
  console.log(users);
}, function (err) {
  console.log(err);
});


console.log('yay');
