export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went Wrong",
    error = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.success === false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
