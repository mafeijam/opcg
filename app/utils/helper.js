export function minMax(numbers) {
  return { min: Math.min(...numbers), max: Math.max(...numbers) }
}

export function makeRange(numbers) {
  const { min, max } = minMax(numbers)
  return {
    min,
    max,
  }
}
