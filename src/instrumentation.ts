import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import {
    LoggerProvider,
    BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import {
    PeriodicExportingMetricReader, MeterProvider
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

// resource
const resource = Resource.default().merge(
    new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    })
)

// log
const loggerProvider = new LoggerProvider({
    resource: resource,
})
const logExporter = new OTLPLogExporter({
    url: `http://otel-collector:4318/v1/logs`,
})
const logProcessor = new BatchLogRecordProcessor(logExporter)
loggerProvider.addLogRecordProcessor(logProcessor)


// metric
const metricExporter = new OTLPMetricExporter({
    url: `http://otel-collector:4318/v1/metrics`,
})

const meterProvider = new MeterProvider({ resource: resource });

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: metricExporter,
}))

const meter = meterProvider.getMeter('meter-info');

// traces
const sdk = new NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter({
        url: `http://otel-collector:4318/v1/traces`,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});

export { loggerProvider, meter }
