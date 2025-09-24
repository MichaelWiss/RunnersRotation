import {app} from '../server.mjs';

// Plain export – Vercel Node runtime can invoke this directly without serverless-http wrapper.
export default function handler(req, res) {
	return app(req, res);
}
