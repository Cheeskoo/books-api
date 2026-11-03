import express from 'express'
import {createNewBook, getBookById, deleteBookById, patchBookById, getAllBooks} from '../controller/books-controller'
import validate from '../middleware/validate'
import {createBookSchema, patchBookSchema} from '../utils/books-schema'

export const booksRouter = express.Router()

booksRouter.get('/', getAllBooks)
booksRouter.post('/', validate(createBookSchema), createNewBook)
booksRouter.get('/:id', getBookById)
booksRouter.delete('/:id', deleteBookById)
booksRouter.patch('/:id', validate(patchBookSchema), patchBookById)