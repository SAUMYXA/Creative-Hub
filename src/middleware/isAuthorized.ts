export {};

const isAuthorized =
  (...allowedRoles: any) =>
  (req: any, res: any, next: any) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .send("You are not allowed to perform this action.");
    }
    next();
  };
module.exports = isAuthorized;
