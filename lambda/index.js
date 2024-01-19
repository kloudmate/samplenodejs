const { loggerProvider } = require('./instrumentation')
const { trace } = require('@opentelemetry/api')

const run = async () => {
  loggerProvider.getLogger().emit({ body: 'This is a log' })

  const tracer = trace.getTracer('tracer')
  const span = tracer.startSpan('test-span')
  span.setAttributes({
    id: 1,
  })
  for (let i = 0; i < 100; i++) {
    console.log('Do work')
  }
  span.end()
}

module.exports = {
  run,
}

