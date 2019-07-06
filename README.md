# better-ms

# Usage

Use this package to easily convert various time formats to milliseconds and milliseconds to time formats.

## Examples

```js
Duration.getMilliseconds('2 days')  // 172800000
Duration.getMilliseconds('1d')      // 86400000
Duration.getMilliseconds('10h')     // 36000000
Duration.getMilliseconds('2.5 hrs') // 9000000
Duration.getMilliseconds('2h')      // 7200000
Duration.getMilliseconds('1m')      // 60000
Duration.getMilliseconds('5s')      // 5000
Duration.getMilliseconds('1y')      // 31557600000
Duration.getMilliseconds('2d4m10s') // 173050000
```

### Convert from Milliseconds

```js
Duration.humanized(60000)       // "1m"
Duration.humanized(2 * 60000)   // "2m"
Duration.humanized(-3 * 60000)  // "-3m"
Duration.humanized('10 hours')  // "10h"
```

### Time Format Written-Out

```js
Duration.humanized(60000, { long: true })             // "1 minute"
Duration.humanized(2 * 60000, { long: true })         // "2 minutes"
Duration.humanized(-3 * 60000, { long: true })        // "-3 minutes"
Duration.humanized(Duration.getMilliseconds('10 hours'), { long: true })  // "10 hours"
Duration.humanized(Duration.getMilliseconds('5d3s'), { verbose: true })  // "5 days 3 seconds"
```

## Features

- Works both in [Node.js](https://nodejs.org) and in the browser
- Unline `ms` this package can parse multiple values `4d4m5s`

## Information
This package was created from `ms` and `pretty-ms`, it just includes modified scripts and is combined into a single class.
