import { Request, Response, NextFunction} from 'express'
import {z} from 'zod'
import formatIssues from '../utils/formatIssues'

export default function validate(schema: z.ZodType){
    return(req: Request, res: Response, next: NextFunction) =>{
        const result = schema.safeParse(req.body)
        if(!result.success){
            res.status(400).json({error: {message: 'Validation failed', details: formatIssues(result.error.issues)}})
            return
        }
        req.body = result.data 
        next()
    }
}

