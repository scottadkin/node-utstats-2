const Importer =  require('./api/importer/importer');
const Message =  require('./api/message');

new Message('Node UTStats 2 Importer module started.','note');

const I = new Importer();

