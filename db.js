// GCloud Datastore Configuration
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();

function fromDatastore(item) {
  item.id = item[Datastore.KEY].id;
  return item;
}

module.exports = { datastore, fromDatastore };
