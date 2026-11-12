"use client";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";
export function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(
    null,
  );
  const request = useRef({ fingerprint: "", key: "" });
  const pending = useRef(false);
  async function run(action: string, data: unknown) {
    if (pending.current) return null;
    pending.current = true;
    setBusy(true);
    setNotice(null);
    const fingerprint = JSON.stringify({ action, data });
    if (request.current.fingerprint !== fingerprint)
      request.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data, key: request.current.key }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setNotice({ text: result.message, ok: true });
      request.current = { fingerprint: "", key: "" };
      router.refresh();
      return result as { message: string; id?: string };
    } catch (e) {
      setNotice({
        text: e instanceof Error ? e.message : "Koneksi terputus. Coba lagi.",
        ok: false,
      });
      return null;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return {
    run,
    busy,
    notice,
    feedback: notice ? (
      <div
        className={`notice ${notice.ok ? "success" : "error"}`}
        role="status"
      >
        {notice.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{notice.text}</span>
      </div>
    ) : null,
  };
}
export function ActionForm({
  action,
  data = {},
  children,
  label = "Simpan",
  variant = "default",
  confirm = false,
  onSuccess,
}: {
  action: string;
  data?: Record<string, unknown>;
  children?: ReactNode;
  label?: string;
  variant?: "default" | "outline" | "destructive" | "amber";
  confirm?: boolean;
  onSuccess?: (result: { message: string; id?: string }) => void;
}) {
  const { run, busy, feedback } = useAction();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    const normalized = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [
        k,
        v === "true" ? true : v === "false" ? false : v,
      ]),
    );
    const r = await run(action, { ...data, ...normalized });
    if (r) onSuccess?.(r);
  }
  return (
    <form className="form-stack action-form" onSubmit={submit}>
      {children}
      {confirm && (
        <label className="checkbox-label">
          <input type="checkbox" required />
          Saya sudah meninjau dan menyetujui tindakan demo ini.
        </label>
      )}
      <Button type="submit" variant={variant} disabled={busy}>
        {busy && <LoaderCircle size={16} className="spin" />}
        {busy ? "Memproses…" : label}
      </Button>
      {feedback}
    </form>
  );
}
export function ActionButton({
  action,
  data,
  label,
  variant = "outline",
}: {
  action: string;
  data: Record<string, unknown>;
  label: string;
  variant?: "default" | "outline" | "destructive" | "amber";
}) {
  return (
    <ActionForm action={action} data={data} label={label} variant={variant} />
  );
}
export function Dialog({
  title,
  trigger,
  children,
}: {
  title: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => ref.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog ref={ref} className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup dialog"
            onClick={() => ref.current?.close()}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="modal-body">{children}</div>
      </dialog>
    </>
  );
}
export function UploadForm({
  kind,
  context,
}: {
  kind: "KYC" | "PROJECT" | "REPORT";
  context?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("kind", kind);
    if (context) data.set("context", context);
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/documents", { method: "POST", body: data });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMessage(d.message);
      setOk(true);
      form.reset();
      router.refresh();
    } catch (e) {
      setOk(false);
      setMessage(e instanceof Error ? e.message : "Unggah gagal.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="upload-form form-stack" onSubmit={submit}>
      <label>
        <Upload size={18} /> Dokumen fiktif · PDF, PNG, JPG · maks. 2 MB
        <input
          type="file"
          name="file"
          accept="application/pdf,image/png,image/jpeg"
          required
        />
      </label>
      <Button variant="outline" type="submit" disabled={busy}>
        {busy ? "Mengunggah…" : "Unggah dokumen"}
      </Button>
      {message && (
        <p role="status" className={`notice ${ok ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
