import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
// import { ZoneContextManager } from "@opentelemetry/context-zone";
// import {
//   CompositePropagator,
//   W3CBaggagePropagator,
//   W3CTraceContextPropagator,
// } from "@opentelemetry/core";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

//exporters
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const resourceSettings = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: "frontend-app",
  [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
});

const newRelicExporter = new OTLPTraceExporter({
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:3006",
  },
  url: `http://localhost:4318/v1/traces`,
});

const provider = new WebTracerProvider({ resource: resourceSettings });

provider.addSpanProcessor(new BatchSpanProcessor(newRelicExporter));

provider.register({
  // contextManager: new ZoneContextManager(),
  // propagator: new CompositePropagator({
  //   propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  // }),
});

const startOtelInstrumentation = () => {
  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        "@opentelemetry/instrumentation-fetch": {
          enabled: true,
          propagateTraceHeaderCorsUrls: /.*/,
          clearTimingResources: true,
          applyCustomAttributesOnSpan: (span, req) => {
            if (req && req.headers) {
              span.setAttribute(
                "http.request.headers",
                JSON.stringify(req.headers)
              );
            }
            if (req && req.body) {
              const requestBody = req.body;
              span.setAttribute("http.request.body", req.body);
            }
          },
        },
      }),
    ],
  });
};

export { startOtelInstrumentation };
