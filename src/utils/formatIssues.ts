import {z} from "zod"

export default function formatIssues(arr: z.core.$ZodIssue[]){
    const error: {"field": string, "message": string}[] = arr.map((item): {"field": string, "message": string} => {
        return {
            "field": item.path.length >= 1  ? item.path.join(): item.code === "unrecognized_keys" ? item.keys.join(): "",
            "message": item.message
        }
    })
    return error
}