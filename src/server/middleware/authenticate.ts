import {User} from "../models/user.model";
import {NextFunction, Request, Response} from "express";

export function authenticate(req: any, res: Response, next: NextFunction): void {
    const token = req.header('x-auth');
    User.findByToken(token).then((user: any) => {
        if (!user) {
            return Promise.reject('Invalid credentials!');
        }
        req.user = user;
        req.token = token;
        return next();
    }).catch((err: string) => res.status(401).send(err));
}