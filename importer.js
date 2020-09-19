import config from './config.js'
import Importer from './api/importer/importer.js'
import Message from './api/message.js'

new Message('Node UTStats 2 Importer module started.','note');

const I = new Importer();

