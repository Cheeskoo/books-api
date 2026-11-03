import {createBook, searchBook, deleteBook, patchBook, getBooks} from './books-service'
import { Request, Response } from 'express'
import {Prisma} from '../generated/prisma/client'
import type{CreateBookInput, PatchBookInput} from '../utils/books-schema'
import {bookIdSchema} from '../utils/books-schema'
import formatIssues from '../utils/formatIssues'

export async function createNewBook(req: Request<{}, unknown, CreateBookInput, {}> ,
res: Response<{error:{message: string}} | {data: Prisma.booksModel} >){
    try{
        const {body} = req
        const newBook: Prisma.booksModel = await createBook(body)
        res.status(201).json({data: newBook})
    } catch(error){
        console.error(error)
        res.status(500).json({error: {message: 'Server unavailable, please try again'}})
    }
}

export async function getBookById(req:Request<{id: string}>, 
    res:Response<{data: Prisma.booksModel} | {error: {message: string, details?: {field: string, message: string}[]}}>){
    try{
        const result = bookIdSchema.safeParse(req.params.id)
        if(!result.success){
            res.status(400).json({error: {
                message: `Validation failed`, details: formatIssues(result.error.issues)
            }})
            return
        }
        const book: Prisma.booksModel | null = await searchBook(result.data)
        if(!book){
            res.status(404).json({error: {message: `The id of the book doesnt exist, check your ID`}})
            return
        }
        res.status(200).json({data: book})
    }catch(error){
        console.error(error)
        res.status(500).json({error: {message: `Server unavailable, please try again`}})
    }
}
export async function deleteBookById(req: Request<{id: string}>, res: Response){
    try{
        const result = bookIdSchema.safeParse(req.params.id)
        if(!result.success){
            res.status(400).json({error: {
                message: `Validation failed`, details: formatIssues(result.error.issues)
            }})
            return
        }
    const book = await deleteBook(result.data)
    res.status(200).json({data: book})
} catch(error){
    if(error instanceof Prisma.PrismaClientKnownRequestError){
        if(error.code === "P2025"){
            res.status(404).json({error: {message: `The id of the book doesnt exist, check your ID`}})
            return
        }
    }
    console.error(error)
    res.status(500).json({error: {message: `Server unavailable, please try again`}})
}
}

export async function patchBookById(
    req: Request<{id: string}, unknown, PatchBookInput>,
    res: Response
){
    try{
        const idResult = bookIdSchema.safeParse(req.params.id)
        if(!idResult.success){
            res.status(400).json({error: {
                message: `Validation failed`, details: formatIssues(idResult.error.issues)
            }})
            return
        }
        const result = await patchBook(idResult.data, req.body)
        if(!result.ok){
            if(result.reason === 'not_found'){
                res.status(404).json({error: {message: `The id of the book doesnt exist, check your ID`}})
                return
            }
            res.status(400).json({error: {message: result.message}})
            return
        }
        res.status(200).json({data: result.book})
    } catch(error){
        console.error(error)
        res.status(500).json({error: {message: `Server unavailable, please try again`}})
    }
}
export async function getAllBooks(req: Request, res: Response<{data: Prisma.booksModel[]} | {error: {message: string}} >){
    try{
        const books = await getBooks()
        res.status(200).json({data: books})
    }catch(error){
        console.error(error)
        res.status(500).json({error: {message: `Server unavailable, please try again`}})
    }
}