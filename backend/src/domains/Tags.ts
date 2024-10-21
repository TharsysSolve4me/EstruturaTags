export interface Tag {
    id: number
    agent: string
    tag: string
    children: Tag[]
    parentId: string
    count: number
} 

export default Tag;