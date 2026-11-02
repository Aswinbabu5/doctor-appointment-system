export function parseParamId(val, name = 'id') {
  const id = parseInt(val, 10);
  if (isNaN(id) || id <= 0) {
    const error = new Error(`Invalid ${name} parameter`);
    error.status = 400;
    throw error;
  }
  return id;
}
