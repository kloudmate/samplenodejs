import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  PeriodicExportingMetricReader,
  MeterProvider,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Context, Link, SpanAttributes, SpanKind } from "@opentelemetry/api";
import {
  Sampler,
  SamplingDecision,
  SamplingResult,
} from "@opentelemetry/sdk-trace-base";
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from "@opentelemetry/core";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { ClientRequest, IncomingMessage, ServerResponse } from "http";
// resource
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "todo-api",
    [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
  })
);

// log
const loggerProvider = new LoggerProvider({
  resource: resource,
});
const logExporter = new OTLPLogExporter({
  url: `http://otel-collector:4318/v1/logs`,
});
const logProcessor = new BatchLogRecordProcessor(logExporter);
loggerProvider.addLogRecordProcessor(logProcessor);

// metric
const metricExporter = new OTLPMetricExporter({
  url: `http://otel-collector:4318/v1/metrics`,
});

const meterProvider = new MeterProvider({ resource: resource });

meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: metricExporter,
  })
);

const meter = meterProvider.getMeter("meter-info");

// traces

class CustomSampler implements Sampler {
  shouldSample(
    context: Context,
    traceId: string,
    spanName: string,
    spanKind: SpanKind,
    attributes: SpanAttributes,
    links: Link[]
  ): SamplingResult {
    if (spanName && spanName.startsWith("fs")) {
      return {
        decision: SamplingDecision.NOT_RECORD,
      };
    }
    if (spanName && spanName.startsWith("middleware")) {
      const sampleProbability = 0.2; // 20% sampling probability
      const shouldSample = Math.random() < sampleProbability;
      return {
        decision: shouldSample
          ? SamplingDecision.RECORD_AND_SAMPLED
          : SamplingDecision.NOT_RECORD,
      };
    }
    return {
      decision: SamplingDecision.RECORD_AND_SAMPLED,
    };
  }

  toString(): string {
    return "CustomSampler";
  }
}

const sdk = new NodeSDK({
  resource: resource,
  traceExporter: new OTLPTraceExporter({
    url: `http://otel-collector:4318/v1/traces`,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
    }),
  ],
  // textMapPropagator: new CompositePropagator({
  //   propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  // }),
  sampler: new CustomSampler(),
  // autoDetectResources: true,
  // contextManager: new ZoneContextManager(),
});

sdk.start();

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("Tracing terminated"))
    .catch((error) => console.log("Error terminating tracing", error))
    .finally(() => process.exit(0));
});

export { loggerProvider, meter };
