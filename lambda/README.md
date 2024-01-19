# OpenTelemetry Lambda

An example demonstrating how to export logs and traces from a Nodejs lambda to KloudMate using OpenTelemetry.

## Lambda layers used
1. An auto instrumentation lambda [layer](https://github.com/open-telemetry/opentelemetry-lambda/releases/tag/layer-nodejs%2F0.3.0) for Nodejs. Read more [here](https://opentelemetry.io/docs/faas/lambda-auto-instrument/)
2. An Opentelemetry Collector [layer](https://github.com/open-telemetry/opentelemetry-lambda/releases/tag/layer-collector%2F0.3.1). Read more [here](https://opentelemetry.io/docs/faas/lambda-collector/)

Note: Since the auto-instrumentation layer does not have support for logs yet, an instrumentation file is provided that adds the required libraries to collect and export logs.

## Prerequisites
- SLS CLI

## Steps to stup
1.  Copy ``.env.example`` to `.env` and set values .
2.  `npm i`
3.  `sls deploy`

