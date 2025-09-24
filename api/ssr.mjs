import serverless from 'serverless-http';
import {app} from '../server.mjs';

export default serverless(app);
