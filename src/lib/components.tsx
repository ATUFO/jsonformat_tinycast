import { Action, ActionPanel, Color, Form, Icon, List, Toast, showToast } from "@raycast/api";
import { type ReactNode, useState } from "react";
import { queryJsonPath } from "./jsonpath";
import {
  JsonValue,
  containerCount,
  containerEntries,
  describeValue,
  isContainer,
  pathToKey,
  previewOf,
} from "./json";

function iconFor(value: JsonValue): { source: Icon; tintColor?: Color } {
  if (value === null) return { source: Icon.Minus, tintColor: Color.SecondaryText };
  if (Array.isArray(value)) return { source: Icon.List, tintColor: Color.Blue };
  if (typeof value === "object") return { source: Icon.Folder, tintColor: Color.Yellow };
  if (typeof value === "string") return { source: Icon.Text, tintColor: Color.Green };
  if (typeof value === "number") return { source: Icon.Hashtag, tintColor: Color.Orange };
  return { source: value ? Icon.Checkmark : Icon.Xmark, tintColor: Color.Magenta };
}

export function JsonTreeList(props: {
  value: JsonValue;
  path?: Array<string | number>;
  title?: string;
}) {
  const path = props.path ?? [];
  const entries = isContainer(props.value)
    ? containerEntries(props.value)
    : ([["value", props.value]] as Array<[string, JsonValue]>);
  const title = props.title ?? (pathToKey(path) || "Root");

  return (
    <List navigationTitle={`JSON · ${title}`} searchBarPlaceholder="Filter keys…" isLoading={false}>
      {entries.map(([key, value]) => {
        const itemPath = [...path, typeof key === "string" && /^\d+$/.test(key) ? Number(key) : key];
        return <JsonListItem key={pathToKey(itemPath)} name={key} value={value} path={itemPath} />;
      })}
    </List>
  );
}

function JsonListItem(props: { name: string; value: JsonValue; path: Array<string | number> }) {
  const { name, value, path } = props;
  const container = isContainer(value);
  const count = containerCount(value);

  return (
    <List.Item
      title={name}
      subtitle={describeValue(value)}
      icon={iconFor(value)}
      accessories={[{ text: previewOf(value) }]}
      actions={
        <ActionPanel>
          {container ? (
            <Action.Push
              title={`Open (${count})`}
              icon={Icon.ChevronDown}
              target={<JsonTreeList value={value} path={path} />}
            />
          ) : (
            <Action.CopyToClipboard title="Copy Value" content={String(value)} />
          )}
          <Action.CopyToClipboard title="Copy JSON" content={JSON.stringify(value, null, 2)} />
          <Action.CopyToClipboard title="Copy Path" content={pathToKey(path)} />
        </ActionPanel>
      }
    />
  );
}

export function JsonInputForm(props: {
  initialText?: string;
  submitTitle: string;
  placeholder?: string;
  extraActions?: ReactNode;
  onSubmit: (text: string) => string | null;
}) {
  const [error, setError] = useState<string | undefined>(undefined);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={props.submitTitle}
            onSubmit={({ text }) => {
              const err = props.onSubmit(String(text ?? ""));
              setError(err ?? undefined);
              if (err) {
                void showToast({ style: Toast.Style.Failure, title: "Invalid JSON", message: err });
              }
            }}
          />
          {props.extraActions}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title="JSON"
        placeholder={props.placeholder ?? '{"key": "value"}'}
        defaultValue={props.initialText ?? ""}
        onChange={() => setError(undefined)}
      />
      {error ? <Form.Description title="Error" text={error} /> : null}
    </Form>
  );
}

export function JsonWorkspace(props: {
  value: JsonValue;
  path?: Array<string | number>;
  title?: string;
}) {
  const [expr, setExpr] = useState("");
  const query = expr.trim();
  const jsonPathMode = query.startsWith("$");
  const path = props.path ?? [];
  const title = props.title ?? (pathToKey(path) || "Root");
  const entries = isContainer(props.value)
    ? containerEntries(props.value)
    : ([["value", props.value]] as Array<[string, JsonValue]>);
  const shown = jsonPathMode
    ? entries
    : query
      ? entries.filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
      : entries;
  const jp = jsonPathMode ? queryJsonPath(props.value, query) : null;

  return (
    <List
      navigationTitle={`JSON · ${title}`}
      isShowingDetail
      searchText={expr}
      onSearchTextChange={setExpr}
      searchBarPlaceholder="Filter keys, or type $ for JSONPath…"
    >
      {!jsonPathMode && path.length === 0 && (
        <WorkspaceItem name="$" value={props.value} path={[]} />
      )}
      {!jsonPathMode &&
        shown.map(([key, value]) => (
          <WorkspaceItem
            key={`${pathToKey(path)}/${key}`}
            name={key}
            value={value}
            path={[...path, typeof key === "string" && /^\d+$/.test(key) ? Number(key) : key]}
          />
        ))}
      {jsonPathMode &&
        (jp && jp.ok
          ? jp.matches.map((match) => (
              <WorkspaceItem
                key={match.path}
                name={match.path}
                value={match.value}
                path={[]}
                title={match.path}
                pathLabel={match.path}
              />
            ))
          : jp && <List.EmptyView title="Invalid JSONPath" description={jp.error} />)}
      {!jsonPathMode && query && shown.length === 0 && (
        <List.EmptyView title="No Matching Keys" />
      )}
    </List>
  );
}

function WorkspaceItem(props: {
  name: string;
  value: JsonValue;
  path: Array<string | number>;
  title?: string;
  pathLabel?: string;
}) {
  const container = isContainer(props.value);
  const count = containerCount(props.value);
  const json = JSON.stringify(props.value, null, 2);
  const valueTitle = props.pathLabel ?? (pathToKey(props.path) || "Root");

  return (
    <List.Item
      title={props.name}
      subtitle={describeValue(props.value)}
      icon={iconFor(props.value)}
      detail={<List.Item.Detail markdown={`\`\`\`json\n${json}\n\`\`\``} />}
      actions={
        <ActionPanel>
          <Action.Push
            title={container ? `Open (${count})` : "View Value"}
            icon={Icon.ChevronDown}
            target={<JsonWorkspace value={props.value} path={props.path} title={valueTitle} />}
          />
          {!container && (
            <Action.CopyToClipboard
              title="Copy Value"
              content={typeof props.value === "string" ? props.value : String(props.value)}
            />
          )}
          <Action.CopyToClipboard title="Copy JSON" content={json} />
          <Action.CopyToClipboard title="Copy Path" content={props.pathLabel ?? pathToKey(props.path)} />
        </ActionPanel>
      }
    />
  );
}
