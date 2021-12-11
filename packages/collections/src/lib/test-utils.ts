export function measureTime(fn: () => unknown) {
  global.gc && global.gc();
  const startTime = Date.now();
  fn();
  const endTime = Date.now();
  return endTime - startTime;
}

export function measure(name: string, fn: () => unknown) {
  const times = [...Array(1000)].map(() => measureTime(fn));
  const medianTime = times.sort()[Math.round(times.length / 2)];
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  return {
    name,
    medianTime,
    opsPerSecond: times.length / (totalTime / 1000),
    runs: times.length,
    totalTime,
  };
}
