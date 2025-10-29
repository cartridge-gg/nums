import TimeAgoJs from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import type * as React from "react";
import ReactTimeAgo from "react-time-ago";

TimeAgoJs.addDefaultLocale(en);

function TimeAgo({
  date,
  ...props
}: React.ComponentProps<typeof ReactTimeAgo>) {
  return (
    // @ts-expect-error
    <ReactTimeAgo date={date} {...props} />
  );
}

export { TimeAgo };
