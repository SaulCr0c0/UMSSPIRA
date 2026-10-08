import { ExperienceDetail } from "../../../../../modules/profile/frontend/components/experience-detail";

export default function WorkExperienceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <ExperienceDetail experienceId={params.id} />;
}
