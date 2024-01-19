const { Resource } = require('@opentelemetry/resources')
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http')
const {
  LoggerProvider,
  SimpleLogRecordProcessor,
} = require('@opentelemetry/sdk-logs')

const resource = Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'otel-lambda-node',
      [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    })
  )

const loggerProvider = new LoggerProvider({
  resource: resource,
})
const logExporter = new OTLPLogExporter()
const logProcessor = new SimpleLogRecordProcessor(logExporter)
loggerProvider.addLogRecordProcessor(logProcessor)
exports.loggerProvider = loggerProvider
