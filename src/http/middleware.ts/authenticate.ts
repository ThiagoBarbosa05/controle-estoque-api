import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  sub: string;
  roles: string[];
  permissions: string[];
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    res.status(401).send({ message: "Não autorizado" });
    return;
  }

  try {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as JwtPayload;
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ message: "Token inválido ou expirado" });
    return;
  }
}
