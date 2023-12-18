import {
    PeriodicExportingMetricReader, MeterProvider
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

const resource = Resource.default().merge(
    new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'my-app',
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
    })
)

const metricExporter = new OTLPMetricExporter({
    url: `https://otel.kloudmate.com:4318/v1/metrics`,
    headers: {
        Authorization: 'sk_qTNwGwVF67KAq2ZDm0DblSIe',
    },
})

const meterProvider = new MeterProvider({ resource: resource });

meterProvider.addMetricReader(new PeriodicExportingMetricReader({
    exporter: metricExporter,
}))

const meter = meterProvider.getMeter('meter-info');

const requestCounter = meter.createCounter('requests_total', {
    description: 'Total number of requests',
});

export const countRequestsMiddleware = (req, res, next) => {
    // Increment the counter for each incoming request
    requestCounter.add(1, {
        'http.method': req.method,
        'http.route': req.originalUrl,
    });

    next();
};


