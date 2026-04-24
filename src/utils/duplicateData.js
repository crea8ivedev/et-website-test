export function duplicateData(data, times = 2, skipIndexes = []) {
  if (!Array.isArray(data) || times < 1) {
    throw new Error("Invalid input: data must be an array and times must be a positive integer.");
  }

  if (!Array.isArray(skipIndexes)) {
    throw new Error("Invalid input: skipIndexes must be an array of indexes.");
  }

  const n = data.length;
  const result = [];
  const skip = new Set(skipIndexes);

  for (let t = 0; t < times; t++) {
    for (let i = 0; i < n; i++) {
      if (skip.has(i) && t > 0) continue;

      const item = data[i];
      if (typeof item === "object" && item !== null) {
        result.push(Array.isArray(item) ? [...item] : { ...item });
      } else {
        result.push(item);
      }
    }
  }

  return result;
}
