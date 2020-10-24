function writeServerResponse(response, responseData, statusCode, header) {
  if (header === "application/json") {
    response.setHeader("Content-Type", header);
    response.status(statusCode).json(responseData);
  }
  response.setHeader("Content-Type", header);
  response.status(statusCode).send(responseData);
}

export default writeServerResponse;
