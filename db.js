// GCloud Datastore Configuration
const { Datastore } = require("@google-cloud/datastore");
const datastore = new Datastore();

function attachId(item) {
  item.id = item[Datastore.KEY].id;
  return item;
}

module.exports = { datastore, attachId };
