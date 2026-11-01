import {z} from 'zod'

export const MAX_BOOK_ID = 2_147_483_647;
export const bookIdSchema = z
.string()
.regex(/^(0|[1-9]\d*)$/, 'id must be a non-negative integer without leading zeros')
.transform(Number)
.refine((n) => n <= MAX_BOOK_ID, `id must be at most ${MAX_BOOK_ID}`)


const title = z.string().min(1, 'Title cant be an empty string').max(200, 'Only 200 characters are available for the title')
const author = z.string().min(1, 'Author cant be an empty string').max(100, 'Only 100 characters are available for the Author')
const status = z.enum(['want_to_read', 'reading', 'finished'], 'Only want_to_read, reading and finished are allowed in status')
const rating = z.int('Rating must be a whole number').min(1, 'Range must be from 1 to 5').max(5, 'Range must be from 1 to 5')
const notes = z.string().min(10, 'Notes should be at least 10 characters').max(2000, 'Only 2000 characters are available for Notes')

export const createBookSchema = z.strictObject({ 
    title,
    author,
    status: status.optional(),
    rating: rating.optional(),
    notes: notes.optional()
}).refine((data)=>  data.status === 'finished' || data.rating === undefined, {error: 'Status must be finished if you want to set a rate', path: ['rating']})

export type CreateBookInput = z.infer<typeof createBookSchema>

export const patchBookSchema = z.strictObject({ 
    title: title.optional(),
    author: author.optional(),
    status: status.optional(),
    rating: z.nullish(rating),
    notes: z.nullish(notes)
}).refine((data) => Object.keys(data).length > 0 , 
{
  error: 'To make changes on book you should pass at least one key to change: title, author, status, rating, notes.',
  when(payload){
    return !payload.issues.some((issue)=> issue.code === "unrecognized_keys")
  }
}).refine((data)=> typeof data.rating !== "number" || !data.status || data.status === "finished", 
{
  error: 'Rating requires status finished. Set status finished and your rating or set your rating null', path: ['rating'], 
  when(payload){
    return !payload.issues.some((issue)=> issue.code)
  }
})

export type PatchBookInput = z.infer<typeof patchBookSchema>