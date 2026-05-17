
export const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const weightedRandom = <T>(items: T[], weights: number[]): T => {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) return items[i];
    random -= weights[i];
  }
  return items[0];
};

export const rollWeighted = <T>(items: T[], weights: number[]): { value: T, prob: number, poolSize: number } => {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  const value = weightedRandom(items, weights);
  const weight = weights[items.indexOf(value)];
  return { value, prob: (weight / totalWeight) * 100, poolSize: items.length };
};

export const rollUniform = <T>(arr: T[]): { value: T, prob: number, poolSize: number } => {
  return { value: randomChoice(arr), prob: (1 / arr.length) * 100, poolSize: arr.length };
};

export const gaussRandom = (mean: number, stdev: number): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdev + mean;
};

export const normalPdf = (x: number, mean: number, stdev: number): number => {
  const exponent = -0.5 * Math.pow((x - mean) / stdev, 2);
  const coefficient = 1 / (stdev * Math.sqrt(2 * Math.PI));
  return coefficient * Math.exp(exponent) * 100;
};
