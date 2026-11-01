import {createBookSchema} from "../utils/books-schema"
import formatIssues from "../utils/formatIssues"

const test = [
    {
        title: "", 
        author: "J.K. Rowling"
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        admin: true
    },
    { 
         title: "Harry Potter", 
         author: "J.K. Rowling",
         status: "reading", 
         rating: 5 
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        created_at: "2000-01-01T00:00:00Z"
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling"
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        status: "finished",
        rating: null 
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        notes: "corta"
    },
    { 
        title: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        author: "J.K. Rowling"
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        status: "finished",
        rating: "5"
    },
    { 
        title: "Harry Potter", 
        author: "J.K. Rowling",
        rating: 4
    }
]

const newArr = test.map((item, index)=> {
    const issue = createBookSchema.safeParse(item)
    console.log(JSON.stringify(issue, null, 2))
    if(!issue.success){
        return {
            name: 'C' + (index + 1),
            error: formatIssues(issue.error.issues)
        }
    }
    return{
        name: 'C' + (index + 1),
        data: issue.success 
    }
})