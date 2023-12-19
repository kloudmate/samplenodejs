// Logging
import path from 'path'
import authentication from '../common-lib/helpers/authentication'
import { addToCache, checkCache } from '../common-lib/helpers/cache'
import customLogger from '../common-lib/middleware/logger'
import config from '../config'
import { countRequestsMiddleware } from '../common-lib/middleware/requestCounter'

const logger = customLogger(path.basename(__filename))
module.exports = async (app) => {
	//:TODO need to secure these apis too.
	const cache = app.get('redisCache')
	const Todo = await require('../models/todo')(app)

	app.use(function (req, res, next) {
		req.realmName = req.headers.realmname
		req.redisKey = config.redis.serviceName
		// let url = req.url.toLowerCase()
		// let allowedUrl = config.application.routesToSkipAuthentication && config.application.routesToSkipAuthentication.filter(p =>{
		//   return url.includes(p.route);
		// })
		// if(allowedUrl && allowedUrl.length > 0 ) {
		//   next();
		// } else {
		authentication(req, res, next)
		// }
	})
	app.use(checkCache)
	app.use(countRequestsMiddleware)

	app.get('/', (req, res, next) => {
		try {
			req.dbData = `Hello world!`
			addToCache(req, res, next)
			res.status(200).json(req.dbData).end()
		} catch (e) {
			logger.error(`Error in get ${e}`)
		}
	})

	app.post('/todo', async (req, res) => {
		try {
			const { title, description } = req.body;
			const todo = await Todo.create({
				title,
				description,
			});
			const { id } = todo;
			const key = `todos_${id}`
			cache.set(key, JSON.stringify(todo), 60);
			logger.info(`New record cached : ${key}`)
			res.json(todo);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

	// Route to get all TODO items
	app.get('/todo', async (req, res) => {
		try {
			const key = 'todos_all';
			const cachedData = await cache.get(key)
			if (cachedData !== null) {
				logger.info(`Cache Hit for ${key}`);
				res.json(JSON.parse(cachedData));
			} else {
				logger.info(`Cache Miss for ${key}`)
				const todos = await Todo.findAll();
				cache.set(key, JSON.stringify(todos), 60);
				res.json(todos);
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

	// Route to get Todo by Id
	app.get('/todo/:id', async (req, res) => {
		try {
			const { id } = req.params;
			const key = `todos_${id}`
			const cachedData = await cache.get(key)
			if (cachedData !== null) {
				logger.info(`Cache Hit for ${key}`);
				res.json(JSON.parse(cachedData));
			} else {
				logger.info(`Cache Miss for ${key}`)
				const todo = await Todo.findByPk(id);
				cache.set(key, JSON.stringify(todo), 60);
				res.json(todo);
			}

		} catch (error) {
			console.error(error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	});

}
