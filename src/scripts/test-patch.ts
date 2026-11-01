import {patchBookSchema} from "../utils/books-schema"
import formatIssues from "../utils/formatIssues"

const test = [
    { status: "reading", rating: 5 },
    { status: "want_to_read", rating: 3 },
    { status: "reading", rating: null },
    { status: "finished", rating: 5 },
    { rating: 5 },
    { status: "reading" },
    { title: "Nuevo" },
    { rating: null },
    { notes: null },
    {},
    { admin: true },
    { title: null },
    { title: "" },
    { notes: "corta" }
]
let newArr = test.map((item, index)=> {
    const issue = patchBookSchema.safeParse(item)
    console.log(JSON.stringify(issue, null, 2))
    if(!issue.success){
        return {
            name: 'P' + (index + 1),
            error: formatIssues(issue.error.issues)
        }
    }
    return{
        name: 'P' + (index + 1),
        data: issue.success 
    }
})