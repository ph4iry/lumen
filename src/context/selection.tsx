'use client';

import { Note, Source } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";

export type SelectionContextData = {
  document: Source,
  notes: Note[],
}[]

export const SelectionContext = createContext<[SelectionContextData, Dispatch<SetStateAction<SelectionContextData>>]>([[], () => {}]);