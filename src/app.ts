import 'dotenv/config'
import express, {Request, Response} from "express"
import prisma from './db/prisma'
export const app = express()

app.use(express.json())

app.get('/health', async (_req: Request, res: Response<{status: string, database: string} | {error: {message: string}}>)=>{
    try{
        const isAlive = await prisma.$queryRaw`SELECT 1 FROM books`
        res.status(200).json({status: "ok", database: "connected"})
    }catch(error){
        console.error(error)
        res.status(503).json({error: {message: `Database unavailable`}})
    }
})

app.use((req: Request,res: Response<{error:{message: string}}>)=>{
    res.status(404).json({error: {message: `La Ruta ${req.originalUrl} con ${req.method} no existe`}})
})