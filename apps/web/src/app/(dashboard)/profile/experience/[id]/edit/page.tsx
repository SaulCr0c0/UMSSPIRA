import { ExperienceForm } from "../../../../../../modules/profile/frontend/components/experience-form";

export default function EditWorkExperiencePage({
  params,
}: {
  params: { id: string };
}) {
  return <ExperienceForm experienceId={params.id} />;
}
