import _publications from "@constant/publications.json";


export const publications = _publications as IPublicationData;


export type PublicationInfo<T extends "conference" | "journal"> = {
  title: string;
  authors: string;
  status?: string;
  note?: string;
  year?: number;
  date?: string;
  link?: {
    text: string;
    url: string;
  }[];
} & (
  T extends "conference" ? { conference: string } : { journal: string }
);

export interface IPublicationData {
  Journal_Papers: PublicationInfo<'journal'>[];
  Conference_Papers: PublicationInfo<'conference'>[];
}
