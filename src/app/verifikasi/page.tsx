import { redirect } from "next/navigation";
import { currentUser } from "@/lib/access";
import { loadPortal } from "@/lib/portal";
import { Shell } from "@/components/shell";
import { Profile } from "@/components/portal-content";
export const dynamic = "force-dynamic";
export default async function Verify() {
  const user = await currentUser();
  if (!user) redirect("/masuk");
  const data = await loadPortal(user);
  return (
    <Shell data={data}>
      <Profile data={data} />
    </Shell>
  );
}
