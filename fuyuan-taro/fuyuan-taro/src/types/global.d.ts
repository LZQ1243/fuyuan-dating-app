/// <reference types="react" />

declare const global: {
  Array: ArrayConstructor
  Date: DateConstructor
  Math: Math
  Object: ObjectConstructor
  String: StringConstructor
  Number: NumberConstructor
  Boolean: BooleanConstructor
  RegExp: RegExpConstructor
  Function: FunctionConstructor
  Error: ErrorConstructor
  Promise: PromiseConstructor
  Map: MapConstructor
  Set: SetConstructor
  JSON: JSON
  console: Console
  setTimeout: typeof setTimeout
  setInterval: typeof setInterval
  clearTimeout: typeof clearTimeout
  clearInterval: typeof clearInterval
  requestAnimationFrame: typeof requestAnimationFrame
  cancelAnimationFrame: typeof cancelAnimationFrame
}

export {}
