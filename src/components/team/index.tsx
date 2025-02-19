import type { FC } from "react";

import { font } from "@/src/theme";

import TeamMember, { type ITeamMember } from "./member";


interface ICategorizedMembers {
  label: string;
  /** @default false */
  hideLabel?: boolean;
  people: ITeamMember[] | ICategorizedMembers[];
}

type ValidLabelTag = "p" | `h${"2"|"3"|"4"|"5"|"6"}`;

interface ITeamProps {
  label: string;
  /** @default false */
  hideLabel?: boolean;
  alignLabelCenter?: boolean;
  members: (ITeamMember | ICategorizedMembers)[];
  /** @default "p" */
  categoryLabelAs?: ValidLabelTag | ValidLabelTag[];
  emailReplacer?: Record<string, string>;
}

const styles = {
  p: 'text-lg font-medium text-gray-800 my-6',
  h2: 'text-4xl font-semibold text-foreground my-12',
  h3: 'text-3xl font-medium text-gray-950 my-10',
  h4: 'text-2xl font-medium text-gray-950 my-9',
  h5: 'text-xl font-medium text-gray-900 my-8',
  h6: 'text-lg font-medium text-gray-900 my-7',
} as const;

const Team: FC<ITeamProps> = ({ label, hideLabel = false, members, categoryLabelAs = "p", alignLabelCenter, emailReplacer }) => {
  const CategoryLabel = (Array.isArray(categoryLabelAs) ? categoryLabelAs[0] : categoryLabelAs) ?? "p";
  const restedCategoryTags = Array.isArray(categoryLabelAs) ? categoryLabelAs.slice(1) : categoryLabelAs;

  const hasChildren = typeof (members[0] as ICategorizedMembers | undefined)?.label === 'string';
  const children = hasChildren ? members as ICategorizedMembers[] : null;
  const people = hasChildren ? null : members as ITeamMember[];

  return (
    <div className="mb-10 w-full">
      <CategoryLabel className={hideLabel ? 'sr-only' : `${font.sometypeMono.className} ${styles[CategoryLabel]}${alignLabelCenter !== false ? ' text-center' : ''}`}>
        {label}
      </CategoryLabel>
      {children?.map(group => (
        <Team
          key={group.label}
          label={group.label}
          hideLabel={group.hideLabel}
          members={group.people}
          categoryLabelAs={restedCategoryTags}
          alignLabelCenter={alignLabelCenter ?? false}
          emailReplacer={emailReplacer}
        />
      ))}
      {Boolean(people?.length) && (
        <div className="landscape:grid landscape:grid-cols-2 landscape:lg:grid-cols-3 landscape:gap-5 xl:gap-8 portrait:py-3 portrait:space-y-2 landscape:py-6 mb-12">
          {people?.map((person, i) => (
            <TeamMember key={i} {...person} emailReplacer={emailReplacer} />
          ))}
        </div>
      )}
    </div>
  );
};


export default Team;
