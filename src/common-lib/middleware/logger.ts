'use strict'
import config from '../../config'
const winston = require('winston')
const { createLogger, format, transports } = winston
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import {
	LoggerProvider,
	BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { SeverityNumber } from '@opentelemetry/api-logs'
const moment = require('moment-timezone')

const resource = Resource.default().merge(
	new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
		[SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
	})
)

const loggerProvider = new LoggerProvider({
	resource: resource,
})
const logExporter = new OTLPLogExporter({
	url: `https://otel.kloudmate.com:4318/v1/logs`,
	headers: {
		Authorization: 'sk_qTNwGwVF67KAq2ZDm0DblSIe',
	},
})
const logProcessor = new BatchLogRecordProcessor(logExporter)
loggerProvider.addLogRecordProcessor(logProcessor)


const { combine, label, printf } = format
const myFormat = printf(info => `${info.timestamp} [${info.level}]: ${info.label} - ${info.message}`)
const appendTimestamp = format((info, opts) => {
	if (opts.tz) info.timestamp = moment().tz(opts.tz).format()
	return info
})
const formatLog = (args: any) =>
	typeof args === 'string' ? args : JSON.stringify(args)
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

customLogger.info = (args: any) => {
	loggerProvider
		.getLogger('otel-logger')
		.emit({ body: formatLog(args), severityNumber: SeverityNumber.INFO })
	return customLogger.info(args)
}

customLogger.warning = (args: any) => {
	loggerProvider
		.getLogger('otel-logger')
		.emit({ body: formatLog(args), severityNumber: SeverityNumber.WARN })
	return customLogger.warning(args)
}

customLogger.error = (args: any) => {
	loggerProvider
		.getLogger('otel-logger')
		.emit({ body: formatLog(args), severityNumber: SeverityNumber.ERROR })
	return customLogger.error(args)
}

// create a stream object with a 'write' function that will be used by `morgan`

// module.exports = customLogger
export default customLogger
