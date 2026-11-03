import prisma from '../db/prisma'
import {Prisma} from '../generated/prisma/client'
import {PatchBookInput} from '../utils/books-schema'

export type PatchBookResult = 
{ok: true, book: Prisma.booksModel} | 
{ok: false, reason: 'not_found'} |
{ok: false, reason: 'rating_requires_finished_status', message: string}

const BOOK_STATUSES = ['want_to_read', 'reading', 'finished'] as const
export type BookStatus = (typeof BOOK_STATUSES)[number]
export type BookState = { status: BookStatus, rating: number | null }

function isBookStatus(value: string): value is BookStatus {
    return (BOOK_STATUSES as readonly string[]).includes(value)
}

export function toBookState(book: Prisma.booksModel): BookState {
    if (!isBookStatus(book.status)) {
        throw new Error(`Unexpected status in database: ${book.status}`)
    }
    return { status: book.status, rating: book.rating }
}

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

export async function patchBook(bookId: number, body: PatchBookInput): Promise<PatchBookResult> {
    const saved = await searchBook(bookId)
    if (saved === null) {
        return {ok: false, reason: 'not_found'}
    }

    const resulting = keysChecker(toBookState(saved), body)
    if (!isStateValid(resulting)) {
        return {
            ok: false,
            reason: 'rating_requires_finished_status',
            message: 'Rating requires status finished. Send status finished with the rating, or send rating null'
        }
    }
    const book = await prisma.books.update({
        where: {
            id: bookId
        },
        data: {
            ...body, updated_at: new Date()
        }
        })
    return {ok: true, book}
}

export function keysChecker(saved: BookState, body: PatchBookInput): BookState {
    let {rating, status} = body
    if(rating === undefined){
        rating = saved.rating
    }
    if(status === undefined){
        status = saved.status
    }
    return {status, rating}
}

export function isStateValid(result: BookState){
    return result.status === 'finished' || result.rating === null
}

export async function getBooks(){
    const books: Prisma.booksModel[] = await prisma.books.findMany({orderBy: {id: 'asc'}})
    return books
}