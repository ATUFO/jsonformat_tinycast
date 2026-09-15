import { Clipboard, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { JsonInputForm, JsonWorkspace } from "./lib/components";
import { JsonValue, parseJson } from "./lib/json";

export default function Command() {
  const { push } = useNavigation();
  const [phase, setPhase] = useState<"loading" | "workspace" | "input">("loading");
  const [clipboard, setClipboard] = useState("");
  const [value, setValue] = useState<JsonValue | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const text = (await Clipboard.readText()) ?? "";
      const result = parseJson(text);
      if (cancelled) return;
      if (result.ok) {
        setValue(result.value);
        setPhase("workspace");
      } else {
        setClipboard(text);
        setPhase("input");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "loading") return <List isLoading />;

  if (phase === "workspace" && value !== null) {
    return <JsonWorkspace value={value} />;
  }

  return (
    <JsonInputForm
      initialText={clipboard}
      submitTitle="Visualize"
      onSubmit={(text) => {
        const result = parseJson(text);
        if (!result.ok) return result.error;
        push(<JsonWorkspace value={result.value} />);
        return null;
      }}
    />
  );
}
