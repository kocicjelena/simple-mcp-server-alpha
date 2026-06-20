"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PromptArgument = {
  name: string;
  description?: string;
  required?: boolean;
};

type PromptOption = {
  name: string;
  description: string;
  arguments?: PromptArgument[];
};

type PromptListResponse = {
  success: boolean;
  data: {
    summary: {
      total: number;
    };
    prompts: PromptOption[];
    usage?: Record<string, unknown>;
  };
};

type PromptCallResponse = {
  answer: string;
  promptName: string;
  promptText: string;
  promptResult: unknown;
};

function createArgsMapForPrompt(
  prompt: PromptOption | null,
  current: Record<string, string> = {}
): Record<string, string> {
  const next: Record<string, string> = {};
  Object.keys(prompt?.arguments ?? []).forEach((key) => {
    next[key] = current[key] ?? "";
  });
  return next;
}

export default function McpShowcasePrompts() {
  const [prompts, setPrompts] = useState<PromptOption[]>([]);
  const [selectedPromptName, setSelectedPromptName] = useState("");
  const [message, setMessage] = useState("");
  const [argsMap, setArgsMap] = useState<Record<string, string>>({});
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PromptCallResponse | null>(null);
  const selectedPromptNameRef = useRef("");

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.name === selectedPromptName) ?? null,
    [prompts, selectedPromptName]
  );

  const arguments_list = useMemo(() => selectedPrompt?.arguments ?? [], [selectedPrompt]);
  const required = useMemo(
    () => arguments_list.filter((arg) => arg.required).map((arg) => arg.name),
    [arguments_list]
  );

  const fetchPrompts = useCallback(async () => {
    const response = await fetch("/api/mcpserver/prompts");
    const data = (await response.json().catch(() => null)) as PromptListResponse | null;

    if (!response.ok) {
      throw new Error(data?.data?.summary?.total ? "Failed to fetch prompts" : "No prompts available");
    }

    return (data?.data?.prompts ?? []) as PromptOption[];
  }, []);

  const applyLoadedPrompts = useCallback((nextPrompts: PromptOption[]) => {
    const currentPromptName = selectedPromptNameRef.current;
    const nextPromptName =
      currentPromptName && nextPrompts.some((prompt) => prompt.name === currentPromptName)
        ? currentPromptName
        : nextPrompts[0]?.name ?? "";
    const nextPrompt = nextPrompts.find((prompt) => prompt.name === nextPromptName) ?? null;

    selectedPromptNameRef.current = nextPromptName;
    setPrompts(nextPrompts);
    setSelectedPromptName(nextPromptName);
    setArgsMap((current) => createArgsMapForPrompt(nextPrompt, current));
  }, []);

  const loadPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    setError(null);

    try {
      const nextPrompts = await fetchPrompts();
      applyLoadedPrompts(nextPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingPrompts(false);
    }
  }, [applyLoadedPrompts, fetchPrompts]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialPrompts() {
      try {
        const nextPrompts = await fetchPrompts();
        if (!ignore) {
          applyLoadedPrompts(nextPrompts);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!ignore) {
          setLoadingPrompts(false);
        }
      }
    }

    void loadInitialPrompts();

    return () => {
      ignore = true;
    };
  }, [applyLoadedPrompts, fetchPrompts]);

  const handlePromptChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPromptName = event.target.value;
    const nextPrompt = prompts.find((prompt) => prompt.name === nextPromptName) ?? null;

    selectedPromptNameRef.current = nextPromptName;
    setSelectedPromptName(nextPromptName);
    setArgsMap((current) => createArgsMapForPrompt(nextPrompt, current));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      if (!selectedPromptName) {
        throw new Error("Select a prompt first");
      }

      const parsedArgs: Record<string, string> = {};

      for (const arg of arguments_list) {
        const raw = argsMap[arg.name]?.trim() ?? "";

        if (!raw) {
          if (arg.required) {
            throw new Error(`Argument '${arg.name}' is required`);
          }
          continue;
        }

        parsedArgs[arg.name] = raw;
      }

      const response = await fetch("/api/mcpclient-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptName: selectedPromptName,
          args: parsedArgs,
          message,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? response.statusText);
      }

      setResult(data as PromptCallResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <strong>Available MCP Prompts ({prompts.length})</strong>
          <button type="button" onClick={loadPrompts} disabled={loadingPrompts}>
            {loadingPrompts ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <label>
          Choose Prompt *
          <select
            value={selectedPromptName}
            onChange={handlePromptChange}
            required
            style={{ width: "100%", marginTop: 4 }}
          >
            {prompts.length === 0 ? (
              <option value="">{loadingPrompts ? "Loading prompts..." : "No prompts found"}</option>
            ) : null}
            {prompts.map((prompt) => (
              <option key={prompt.name} value={prompt.name}>
                {prompt.name}
              </option>
            ))}
          </select>
        </label>

        {selectedPrompt?.description ? (
          <div style={{ color: "#a1a1aa", border: "1px solid #27272a", padding: 10 }}>
            {selectedPrompt.description}
          </div>
        ) : null}

        <label>
          Message
          <textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Optional note or context for the prompt"
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        {arguments_list.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <strong>Prompt Arguments</strong>
            {arguments_list.map((arg) => {
              const isRequired = arg.required;
              const currentValue = argsMap[arg.name] ?? "";

              return (
                <label key={arg.name}>
                  {arg.name} {isRequired ? "*" : ""}
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(event) =>
                      setArgsMap((prev) => ({ ...prev, [arg.name]: event.target.value }))
                    }
                    placeholder={isRequired ? "Required" : "Optional"}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                  {arg.description ? (
                    <small style={{ display: "block", color: "#71717a" }}>
                      {arg.description}
                    </small>
                  ) : null}
                </label>
              );
            })}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              backgroundColor: "#7f1d1d",
              border: "1px solid #dc2626",
              padding: 10,
              borderRadius: 4,
              color: "#fecaca",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        <button type="submit" disabled={submitting || loadingPrompts || !selectedPromptName}>
          {submitting ? "Invoking..." : "Invoke Prompt"}
        </button>
      </form>

      {result ? (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #27272a",
            borderRadius: 4,
            maxWidth: 820,
            margin: "2rem auto 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Result from {result.promptName}</strong>
            <button
              type="button"
              onClick={() => setResult(null)}
              style={{ fontSize: "0.875rem" }}
            >
              Clear
            </button>
          </div>

          {result.answer ? (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                backgroundColor: "#18181b",
                borderRadius: 4,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: "0.875rem",
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {result.answer}
            </div>
          ) : null}

          {result.promptText ? (
            <details style={{ marginTop: "0.75rem" }}>
              <summary style={{ cursor: "pointer", color: "#a1a1aa" }}>
                Raw Response
              </summary>
              <pre
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  backgroundColor: "#18181b",
                  borderRadius: 4,
                  fontSize: "0.75rem",
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                {result.promptText}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
