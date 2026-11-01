import express from 'express'
import {createNewBook, getBookById, deleteBookById} from '../controller/books-controller'
import validate from '../middleware/validate'
import {createBookSchema} from '../utils/books-schema'

export const booksRouter = express.Router()

booksRouter.post('/', validate(createBookSchema), createNewBook)
booksRouter.get('/:id', getBookById)
booksRouter.delete('/:id', deleteBookById)