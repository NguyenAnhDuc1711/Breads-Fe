import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../ui/primitives";
import NextLink from "next/link";
import { IPost } from "../../../../store/PostSlice";
import { UserInfoBox } from "../../../UserInfoPopover";
import "./index.css";

const PostContent = ({ post, content }: { post: IPost; content: string }) => {
  const tagInfo = post.usersTagInfo || [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const usernameRegex = /@[\w.]+/;
  const contentArr = content
    ?.split(/(https?:\/\/[^\s]+|@[\w.]+)/g)
    ?.filter((part) => !!part.trim());

  return (
    <>
      {contentArr?.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <span
              key={index}
              className="post-content__url-wrap"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <a
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="post-content__link"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {part}
              </a>
            </span>
          );
        } else if (part.match(usernameRegex)) {
          const matchedUser = tagInfo.find(
            (user) => `@${user.username}` === part
          );
          return (
            <Popover trigger="hover" placement="bottom-start" key={index}>
              <PopoverTrigger>
                <NextLink
                  href={matchedUser ? `/users/${matchedUser._id}` : "#"}
                  className="post-content__link"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {part}
                </NextLink>
              </PopoverTrigger>
              {matchedUser && (
                <PopoverContent
                  top="-1"
                  left="-1"
                  transform="translateX(-50%)"
                  borderRadius={"10px"}
                  zIndex={10000}
                >
                  <UserInfoBox user={matchedUser} />
                </PopoverContent>
              )}
            </Popover>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default PostContent;
