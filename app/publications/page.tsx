import type { Metadata } from "next";
import { publications } from "@utils/publication";
import { mdxComponents as MDX } from "@cp/mdx";
import { PageTitle } from "@cp/layout-body";
import PublicationList from "@cp/publication-list";


export const metadata: Metadata = {
  title: 'Publications',
};

export default function Publications() {
  return (
    <>
      <PageTitle>Publications</PageTitle>
      <MDX.h2>Journal Papers</MDX.h2>
      <PublicationList publications={publications.Journal_Papers} />
      <MDX.h2>Conference Papers</MDX.h2>
      <PublicationList publications={publications.Conference_Papers} />
    </>
  );
}
