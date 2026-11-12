import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ peran?: string }>;
}) {
  const { peran } = await searchParams;
  return (
    <>
      <header className="public-header">
        <Brand />
      </header>
      <main id="main" className="register-page panel">
        <AuthForm
          register
          initialRole={peran === "nelayan" ? "nelayan" : "investor"}
        />
      </main>
    </>
  );
}
