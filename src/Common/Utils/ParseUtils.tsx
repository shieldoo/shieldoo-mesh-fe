import React from "react";

export function deepClone<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function wrapLinks(inputText: string, className?: string): React.ReactNode {
  // eslint-disable-next-line no-useless-escape
  const regex = /\b(?:https?|ftp|rdp|vnc|ssh):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
  const splitText = inputText.split(regex);

  if (splitText.length <= 1) {
    return inputText;
  }

  const matches = inputText.match(regex) || [];

  return splitText.reduce(
    (arr: string[], element: any, index: number) =>
      matches[index]
        ? [
            ...arr,
            element,
            <a key={`link-${index}`} className={className} target="_blank" rel="noreferrer" href={`${matches[index]}`}>
              {matches[index]}
            </a>,
          ]
        : [...arr, element],
    []
  );
}
