try {
  rs.conf();
  print('Replica set already configured');
} catch (error) {
  rs.initiate({
    _id: 'rs0',
    members: [
      { _id: 0, host: 'mongo:27017' },
      { _id: 1, host: 'mongo1:27017' },
      { _id: 2, host: 'mongo2:27017' },
      { _id: 3, host: 'mongo3:27017' },
    ],
  });
  print('Replica set initiated');
}
