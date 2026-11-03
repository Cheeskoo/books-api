import 'dotenv/config'
import {keysChecker, isStateValid, searchBook, toBookState} from '../controller/books-service'
import type {BookState} from '../controller/books-service'
import type {PatchBookInput} from '../utils/books-schema'

const savedCases: BookState[] = [
    {status: 'reading', rating: null},
    {status: 'finished', rating: 4},
    {status: 'finished', rating: 4},
    {status: 'finished', rating: 4},
    {status: 'reading', rating: null}
]

const bodyCases: PatchBookInput[] = [
    {rating: 5},
    {status: 'reading'},
    {status: 'reading', rating: null},
    {title: 'Nuevo'},
    {status: 'finished'}
]

function runCases() {
    const results = savedCases.map((saved, i) => {
        const resulting = keysChecker(saved, bodyCases[i])
        return {resulting, valid: isStateValid(resulting)}
    })
    console.log(results)
}

async function runRealBook() {
    const book = await searchBook(4) // usa un id que exista en tu tabla
    if (book === null) {
        console.log('Book not found')
        return
    }
    const savedState = toBookState(book)
    console.log(keysChecker(savedState, {status: 'reading', rating: null}))
}

runCases()
runRealBook().catch(console.error)