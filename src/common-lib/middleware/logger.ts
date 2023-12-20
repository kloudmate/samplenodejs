'use strict'
import config from '../../config'
const winston = require('winston')
const { createLogger, format, transports } = winston
import { SeverityNumber } from '@opentelemetry/api-logs'
import { loggerProvider } from '../../instrumentation'
const moment = require('moment-timezone')

const { combine, label, printf } = format

const myFormat = printf(info => {
	const message: string = typeof info.message === 'string' ? info.message : JSON.stringify(info.message);
	const formatedMessage: string = `${info.timestamp} [${info.level}]: ${info.label} - ${message}`

	if (info.level === 'info') {
		loggerProvider
			.getLogger('otel-logger')
			.emit({ body: formatedMessage, severityNumber: SeverityNumber.INFO })
	}
	else if (info.level === 'error') {
		loggerProvider
			.getLogger('otel-logger')
			.emit({ body: formatedMessage, severityNumber: SeverityNumber.ERROR })
	}
	else {
		loggerProvider
			.getLogger('otel-logger')
			.emit({ body: formatedMessage, severityNumber: SeverityNumber.WARN })
	}
	return formatedMessage;
})

const appendTimestamp = format((info, opts) => {
	if (opts.tz) info.timestamp = moment().tz(opts.tz).format()
	return info
})

const customLogger = module => {
	const logger = createLogger({
		//TODO: Need to read the level from config
		level: config.logger.level || 'info',
		// colorize: true,
		format: combine(label({ label: module }), appendTimestamp({ tz: 'Asia/Kolkata' }), myFormat),
		transports: [new transports.Console()],
	})
	logger.stream = {
		// @ts-ignore
		write: function (message, encoding) {
			// use the 'info' log level so the output will be picked up by both transports (file and console)
			logger.info(message)
		},
	}

	return logger
}

// create a stream object with a 'write' function that will be used by `morgan`

// module.exports = customLogger
export default customLogger
