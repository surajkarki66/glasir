import DAOs from "../dao/index";
import ApiError from "../errors/ApiError";

export const onlyClientCanDoThisAction = (req, res, next) => {
  const { role } = req.jwt;
  if (role === "client") {
    return next();
  }
  next(ApiError.forbidden("Access denied: Only client can do this action"));
  return;
};

export const onlySameClientCanDoThisAction = async (req, res, next) => {
  const { aud } = req.jwt;
  const clientId = req.params.clientId || req.body.clientId;
  const result = await DAOs.clientsDAO.getClientByUserId(aud);
  if (result && result._id.toString() === clientId) {
    return next();
  }
  next(
    ApiError.forbidden("Access denied: Only same client can do this action"),
  );
  return;
};
