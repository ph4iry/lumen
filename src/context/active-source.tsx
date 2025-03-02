'use client';
import { Source, Note } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";

export type ActiveSourceData = {
  document: Source,
  notes: Note[],
}


export const ActiveSourceContext = createContext<[ActiveSourceData | null, Dispatch<SetStateAction<ActiveSourceData | null>>]>([null, () => {}]);