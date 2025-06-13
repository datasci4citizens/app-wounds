import * as React from "react";

// By: typcn
// See: https://v0.app/icon/typcn/keyboard
// Example: <IconTypcnKeyboard width="24px" height="24px" />

export const IconTypcnKeyboard = ({
  height = "1em",
  fill = "#A6BBFF",
  focusable = "false",
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "children">) => (
  <svg
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    height={height}
    focusable={focusable}
    {...props}
  >
    <path
      fill={fill}
      d="M8 13h7v2H8zm-3 0h2v2H5zm0-4h2v1H5zm3 3v-1H5v1h2zm0-3h1v1H8zm1 2h1v1H9zm1-2h1v1h-1zm1 2h1v1h-1zm1-2h1v1h-1zm1 2h1v1h-1zm1-2h1v1h-1zm1 2h1v1h-1zm1-2h1v1h-1zm1 3h2V9h-1v2h-1zm1 1h-1v1h-1v1h3v-1h-1zm2-7H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m0 10H4V8h16z"
    />
  </svg>
);