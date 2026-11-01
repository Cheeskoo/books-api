import 'dotenv/config'
import express, {Request, Response} from "express"
import {booksRouter} from './routes/books-routes' 
import prisma from './db/prisma'
import {patchBookSchema} from './utils/books-schema'
import formatIssues from './utils/formatIssues'


export const app = express()

app.use(express.json())

app.get('/health', async (_req: Request, res: Response<{status: string, database: string} | {error: {message: string}}>)=>{
    try{
        const isAlive: {string: number}[] = await prisma.$queryRaw`SELECT 1`
        res.status(200).json({status: "ok", database: "connected"})
    }catch(error){
        console.error(error)
        res.status(503).json({error: {message: `Database unavailable`}})
    }
})
app.patch('/try', (req, res) =>{
    const result = patchBookSchema.safeParse(req.body)
    if(!result.success){
        res.status(400).json({error:{ message: "Validation failed", details: formatIssues(result.error.issues)}})
        return
    }
    res.json(result)
})
app.use('/books', booksRouter)

app.use((req: Request,res: Response<{error:{message: string}}>)=>{
    res.status(404).json({error: {message: `La Ruta ${req.originalUrl} con ${req.method} no existe`}})
})
