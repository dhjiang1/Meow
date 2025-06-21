export function getInteger(value: unknown, paramName: string, required: boolean = false) {
  let error = "";
  if (value === "" || value === undefined || value === null) {
    if (required) {
      error = `${paramName} is required`;
    } else {
      return undefined;
    }
  }

  if (!error && isNaN(value as number)) {
    error = `${paramName} should be an integer`;
  }

  const x = parseFloat(value as string);
  if (!error && (x | 0) !== x) {
    error = `${paramName} should be an integer`;
  }

  if (error) {
    throw new Error(error);
  }

  return parseInt(value as string);
}
