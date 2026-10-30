import {z} from 'zod'

export const MAX_BOOK_ID = 2_147_483_647;

export const bookIdSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, 'id must be a non-negative integer without leading zeros')
  .transform(Number)
  .refine((n) => n <= MAX_BOOK_ID, `id must be at most ${MAX_BOOK_ID}`)

export const createBookSchema = z.strictObject({ 
    title:  z.string().min(1, 'Title cant be an empty string').max(200, 'Only 200 characters are available for the title'),
    author: z.string().min(1, 'Author cant be an empty string').max(100, 'Only 100 characters are available for the Author'),
    status: z.enum(['want_to_read', 'reading', 'finished'], 'Only want_to_read, reading and finished are allowed in status').optional(),
    rating: z.int('Rating must be a whole number').min(1, 'Range must be from 1 to 5').max(5, 'Range must be from 1 to 5').optional(),
    notes: z.string().min(10, 'Notes should be at least 10 characters').max(2000, 'Only 2000 characters are available for Notes').optional()
}).refine((data)=>  data.status === 'finished' || data.rating === undefined, {error: 'Status must be finished if you want to set a rate', path: ['rating']})

export type CreateBookInput = z.infer<typeof createBookSchema>