import { redirect } from "next/navigation";
import { currentUser } from "@/lib/access";
import { rolePath } from "@/lib/utils";
export default async function Portal() {
  const user = await currentUser();
  redirect(user ? rolePath[user.role] : "/masuk");
}
