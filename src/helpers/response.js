function writeServerResponse(...args) {
  const [response, data, statusCode, header] = args;
  response.setHeader("Content-Type", header);
  return response.status(statusCode).json(data);
}

export default writeServerResponse;
