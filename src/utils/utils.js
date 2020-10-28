function writeServerResponse(response, responseData, statusCode, header) {
  response.setHeader("Content-Type", header);
  return response.status(statusCode).json(responseData);
}

export default writeServerResponse;
