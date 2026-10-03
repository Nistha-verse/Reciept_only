// Memory-only receipt inputs. Original upload bytes must survive the string bridge unchanged.
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileCheck2, FolderOpen, LockKeyhole } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ErrorView } from "@/components/common/ErrorView";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useWizard } from "@/store/wizard";
import { sdk, toError, ReceiptsError, type ErrorCode } from "@/lib/sdk";
import { formatDate } from "@/lib/utils";

export function ReceiptInput({
  check,
  checking,
}: {
  check: () => void;
  checking: boolean;
}) {
  const [tab, setTab] = useState("upload");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [inputError, setInputError] = useState<ErrorCode>();
  const source = useWizard((state) => state.source);
  const dispatch = useWizard((state) => state.dispatch);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const inbox = useQuery({
    queryKey: ["inbox"],
    queryFn: ({ signal }) => sdk.inbox(signal),
    enabled: tab === "inbox",
    gcTime: 0,
  });

  function clearSource() {
    const demo = useWizard.getState().demo;
    dispatch({ type: "RESET" });
    useWizard.getState().setDemo(demo);
  }
  async function readFile(file: File | undefined) {
    if (!file) return;
    const id = ++generation.current;
    clearSource();
    setLoadingFile(true);
    setInputError(undefined);
    setFileLoaded(false);
    try {
      if (!file.name.toLowerCase().endsWith(".eml"))
        throw new ReceiptsError("INVALID_INPUT");
      if (file.size > 1024 * 1024) throw new ReceiptsError("BODY_TOO_LARGE");
      const bytes = await file.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      // Reject a source the paste endpoint would change; no frontend normalization.
      if (
        /(?<!\r)\n/.test(text) ||
        new TextEncoder().encode(text).byteLength !== bytes.byteLength
      )
        throw new ReceiptsError("EMAIL_PARSE_FAILED");
      if (id !== generation.current) return;
      dispatch({ type: "SOURCE", source: { rawEmail: text } });
      setFileLoaded(true);
    } catch (error: unknown) {
      if (id === generation.current)
        setInputError(
          error instanceof ReceiptsError ? error.code : "EMAIL_PARSE_FAILED",
        );
    } finally {
      if (id === generation.current) setLoadingFile(false);
    }
  }

  return (
    <>
      <span className="eyebrow">01 / Bring something real</span>
      <h2>Your receipt is your way in.</h2>
      <p className="muted text-sm mb-6">
        An original order-confirmation email, checked on your device. Not a
        screenshot. Not a star rating you made up.
      </p>
      <div className="mb-6">
        <label htmlFor="provider" className="field-label">
          Receipt provider
        </label>
        <select id="provider" className="field" defaultValue="zomato">
          <option value="zomato">Zomato · available in Stage 1</option>
          <option disabled>Swiggy · not supported yet</option>
          <option disabled>Amazon · not supported yet</option>
        </select>
        <p className="field-help">
          The merchant is resolved by the SDK. The current fallback is “Zomato
          order”.
        </p>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          generation.current++;
          setTab(value);
          setFileLoaded(false);
          setLoadingFile(false);
          setInputError(undefined);
          clearSource();
        }}
      >
        <TabsList className="tabs-list" aria-label="Receipt source">
          <TabsTrigger className="tabs-trigger" value="upload">
            Upload .eml
          </TabsTrigger>
          <TabsTrigger className="tabs-trigger" value="paste">
            Paste source
          </TabsTrigger>
          <TabsTrigger className="tabs-trigger" value="inbox">
            Local inbox
          </TabsTrigger>
          <TabsTrigger className="tabs-trigger" value="gmail" disabled>
            Gmail · unavailable
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <label
            className="dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void readFile(event.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              accept=".eml,message/rfc822"
              className="sr-only"
              aria-label="Upload original .eml receipt"
              onChange={(event) => {
                void readFile(event.target.files?.[0]);
                event.target.value = "";
              }}
              disabled={loadingFile}
            />
            {fileLoaded ? (
              <FileCheck2 size={34} strokeWidth={1.3} aria-hidden="true" />
            ) : (
              <Upload size={34} strokeWidth={1.3} aria-hidden="true" />
            )}
            <strong className="block text-sm">
              {loadingFile
                ? "Reading file on this device…"
                : fileLoaded
                  ? "Receipt loaded into memory"
                  : "Drop your original receipt here"}
            </strong>
            <span className="muted text-xs block mt-2">
              {fileLoaded
                ? "Ready for the signature check. No file is saved by this app."
                : "or choose a .eml file · up to 1 MB"}
            </span>
          </label>
          <p className="field-help mt-3">
            Use “Show original” → “Download original” in your email app. Upload
            requires UTF-8 and intact CRLF line endings. For another encoding,
            use the local inbox to preserve original bytes.
          </p>
        </TabsContent>
        <TabsContent value="paste">
          <label htmlFor="raw-source" className="field-label">
            Complete original email source
          </label>
          <textarea
            id="raw-source"
            className="field mono text-xs min-h-52 resize-y"
            value={source && "rawEmail" in source ? source.rawEmail : ""}
            onChange={(event) => {
              if (
                new TextEncoder().encode(event.target.value).byteLength >
                1024 * 1024
              ) {
                setInputError("BODY_TOO_LARGE");
                return;
              }
              setInputError(undefined);
              dispatch({
                type: "SOURCE",
                source: { rawEmail: event.target.value },
              });
            }}
            placeholder="Paste the full source, including original headers…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-describedby="source-help"
          />
          <p id="source-help" className="field-help">
            The SDK handles pasted line endings. We don’t edit, trim or rewrite
            this source.
          </p>
        </TabsContent>
        <TabsContent value="inbox">
          {inbox.isPending ? (
            <p role="status" className="muted text-sm py-8">
              Loading local sample metadata…
            </p>
          ) : inbox.isError ? (
            <ErrorView
              code={toError(inbox.error).code}
              retry={() => void inbox.refetch()}
            />
          ) : inbox.data?.length ? (
            <fieldset className="stack !gap-3">
              <legend className="sr-only">Choose a local receipt</legend>
              {inbox.data.map((item) => (
                <label key={item.id} className="inbox-choice">
                  <input
                    type="radio"
                    name="inbox"
                    checked={source?.inboxId === item.id}
                    onChange={() =>
                      dispatch({ type: "SOURCE", source: { inboxId: item.id } })
                    }
                  />
                  <span>
                    <strong className="block text-sm">{item.subject}</strong>
                    <span className="text-xs muted">
                      {item.sender} · {formatDate(item.date)}
                    </span>
                  </span>
                </label>
              ))}
              <p className="field-help">
                Inbox metadata is not verified. Unsupported or invalid samples
                may be rejected.
              </p>
            </fieldset>
          ) : (
            <EmptyState
              title="Your local inbox is empty."
              description="Place original .eml files in the gitignored samples/ directory, then refresh."
              action={
                <Button variant="outline" onClick={() => void inbox.refetch()}>
                  <FolderOpen />
                  Refresh inbox
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>
      {inputError && (
        <div className="mt-5">
          <ErrorView code={inputError} compact />
        </div>
      )}
      <div className="privacy-note">
        <LockKeyhole size={15} aria-hidden="true" />
        <span>
          <strong>Your email never leaves this device.</strong> Verification
          sends it only to your localhost bridge. It stays out of browser
          storage, logs, and chain transactions.
        </span>
      </div>
      <div className="wizard-actions">
        <span className="mono text-[10px] muted">
          STAGE 1 · LOCAL DKIM CHECK
        </span>
        <Button
          onClick={check}
          disabled={
            !source ||
            ("rawEmail" in source && !source.rawEmail?.trim()) ||
            checking ||
            loadingFile
          }
        >
          Check my receipt
        </Button>
      </div>
    </>
  );
}
