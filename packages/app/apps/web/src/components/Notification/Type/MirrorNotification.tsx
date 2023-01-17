import Markup from "@components/Shared/Markup";
import UserPreview from "@components/Shared/UserPreview";
import { SwitchHorizontalIcon } from "@heroicons/react/solid";
import formatTime from "@lib/formatTime";
import type { MessageDescriptor } from "@lingui/core/cjs/i18n";
import { defineMessage } from "@lingui/macro";
import { Trans } from "@lingui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { NewMirrorNotification } from "lens";
import Link from "next/link";
import type { FC } from "react";

import { NotificationProfileAvatar, NotificationProfileName } from "../Profile";

dayjs.extend(relativeTime);

interface Props {
  notification: NewMirrorNotification;
}

const messages: Record<string, MessageDescriptor> = {
  comment: defineMessage({
    id: "<0><1/> commented on your <2>comment</2></0>",
  }),
  mirror: defineMessage({
    id: "<0><1/> commented on your <2>mirror</2></0>",
  }),
  post: defineMessage({
    id: "<0><1/> commented on your <2>post</2></0>",
  }),
};

const defaultMessage = (typeName: string): string => {
  return "<0><1/> commented on your <2>" + typeName + "</2></0>";
};

const MirrorNotification: FC<Props> = ({ notification }) => {
  const typeName = notification?.publication.__typename?.toLowerCase() || "";
  return (
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-4/5">
        <div className="flex items-center space-x-3">
          <SwitchHorizontalIcon className="h-6 w-6 text-brand-500/70" />
          <UserPreview profile={notification?.profile}>
            <NotificationProfileAvatar profile={notification?.profile} />
          </UserPreview>
        </div>
        <div className="ml-9">
          <Trans
            id={messages[typeName]?.id || defaultMessage(typeName)}
            components={[
              <span
                className="pl-0.5 text-gray-600 dark:text-gray-400"
                key=""
              />,
              <NotificationProfileName
                profile={notification?.profile}
                key=""
              />,
              <Link
                href={`/posts/${notification?.publication?.id}`}
                className="font-bold"
                key=""
              />,
            ]}
          />
          <Link
            href={`/posts/${notification?.publication?.id}`}
            className="lt-text-gray-500 line-clamp-2 linkify mt-2"
          >
            <Markup>{notification?.publication?.metadata?.content}</Markup>
          </Link>
        </div>
      </div>
      <div
        className="text-gray-400 text-[12px]"
        title={formatTime(notification?.createdAt)}
      >
        {dayjs(new Date(notification?.createdAt)).fromNow()}
      </div>
    </div>
  );
};

export default MirrorNotification;
