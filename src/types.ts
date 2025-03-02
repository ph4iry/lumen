export interface Source {
  url?: string // if pdf maybe dataurl? idk how this works
  title: string,
  id: string,
  content: string, // the text content of the document
}

export interface Note {
  title: string,
  content: string, // a note (eg. characteristics, other smaller notes) that build up a mindmap
  id: string,
  edge: {
    source: string, // the id of the source node
    id: string, // the id of the edge connecting the note to the document
  },
  citation: string // as in, the explicit quote used to justify the summary from the target document
}