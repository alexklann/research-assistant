export interface ResearchPaper {
    title: string;
    authors: { name: string }[];
    abstract: string;
    fullText: string;
    downloadUrl: string;
    publishedDate: string;
    id: number;
}