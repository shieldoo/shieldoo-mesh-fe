import { CodeBlock } from "react-code-blocks";
import React from "react";

const formatJson = (log: string): string => {
  try {
    return JSON.stringify(JSON.parse(log), undefined, 4)
  } catch (e) {
    return "An error occurred while processing the json content."
  }
}
type JsonViewerProps = {
  content: string | undefined
}

const JsonViewer = (props: JsonViewerProps) => {
  return (
    <div className="mb-5 mr-2 mt-5 ml-8">
      <CodeBlock
        text={props.content ? formatJson(props.content) : "No content available."}
        language="json"
        showLineNumbers={true}
      />
    </div>
  );
}

export default JsonViewer;