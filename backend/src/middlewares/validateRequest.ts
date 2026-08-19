import { body, validationResult, type ValidationError, type ValidationChain } from "express-validator";
import { Response, NextFunction, Request } from "express";
import { sendError } from "../utils/response";

export function validate(checks: ValidationChain[]): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(checks.map((check) => check.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorObj: Record<string, unknown> = {};
      errors.array().forEach((err: ValidationError) => {
        const key = err.type === "field" ? (err as any).param : "general";
        errorObj[key] = err.msg;
      });
      sendError(res, "Validation failed", 400, errorObj);
      return;
    }

    next();
  };
}

export { validationResult, body, ValidationChain };

