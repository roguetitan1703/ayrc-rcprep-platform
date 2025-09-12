export function success(res, data = {}, status = 200) {
  return res.status(status).json(data);
}

export function badRequest(message = "Bad Request") {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export function unauthorized(message = "Unauthorized") {
  const err = new Error(message);
  err.status = 401;
  return err;
}

export function forbidden(message = "Forbidden") {
  const err = new Error(message);
  err.status = 403;
  return err;
}

export function notFoundErr(message = "Not Found") {
  const err = new Error(message);
  err.status = 404;
  return err;
}
