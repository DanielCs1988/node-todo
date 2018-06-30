import {User} from "../models/user.model";
import {NextFunction, Request, Response} from "express";

export async function authenticate(req: any, res: Response, next: NextFunction) {
    const token = req.header('x-auth');
    try {
        const user = await User.findByToken(token);
        if (!user) {
            throw new Error('Invalid credentials!');
        }
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send('Invalid credentials!');
    }
}