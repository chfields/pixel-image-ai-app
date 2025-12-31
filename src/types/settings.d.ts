
declare interface AppSettings { 
    directory: string
    dimensions: {
        width: number
        height: number
    },
    elementType?: "tree" | "matrix"
}