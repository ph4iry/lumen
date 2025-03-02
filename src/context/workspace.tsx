'use client';

import { Note, Source } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";


export type WorkspaceContextData = {
  document: Source,
  notes: Note[],
}[]



export const WorkspaceContext = createContext<[WorkspaceContextData, Dispatch<SetStateAction<WorkspaceContextData>>]>([[], () => {}]);