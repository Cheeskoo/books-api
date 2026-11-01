import prisma from '../db/prisma'
import {Prisma} from '../generated/prisma/client'

export async function createBook(data: Prisma.booksCreateInput){
    const newBook: Prisma.booksModel = await prisma.books.create({
    data: data
})
    return newBook
}

export async function searchBook(bookId: number){
    const book: Prisma.booksModel | null = await prisma.books.findUnique({
        where: {
            id: bookId
        }
    })
    return book
}

export async function deleteBook(bookId: number){
    const book = await prisma.books.delete({
        where: {
            id: bookId
        }
    })
    return book
}