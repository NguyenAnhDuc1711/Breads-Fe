import { Spinner, Text } from "../ui/primitives";
import { memo, useEffect, useState } from "react";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import { GET } from "../../config/API";
import useDebounce from "../../hooks/useDebounce";
import { IUserShortInfo, updatePostInfo } from "../../store/PostSlice";
import { updateHasMoreData } from "../../store/UtilSlice";
import { addEvent } from "../../util";
import InfiniteScroll from "../InfiniteScroll";
import UserBox from "../UserFollowBox/UserBox";
import UserBoxSekeleton from "../UserFollowBox/UserBox/skeleton";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { IUser } from "../../store/UserSlice";

const UsersTagBox = ({
  searchValue,
  setOpenTagBox,
}: {
  searchValue: string;
  setOpenTagBox: Function;
}) => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const hasMoreData = useAppSelector(
    (state: AppState) => state.util.hasMoreData
  );
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);

  const debounceValue = useDebounce(searchValue, 500);
  const [users, setUsers] = useState<IUserShortInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUsers([]);
    setIsLoading(true);
  }, [searchValue]);

  const handleGetUsersTag = async ({ page }) => {
    try {
      if (!!searchValue?.trim()) {
        const data: IUserShortInfo[] | null | undefined = await GET({
          path: Route.USER + USER_PATH.USERS_TO_TAG,
          params: {
            userId: userInfo._id,
            page: page,
            limit: 10,
            searchValue: debounceValue,
          },
        });
        if (!!data) {
          setUsers([...users, ...data]);
          setIsLoading(false);
          if (!!data?.[0]) {
            if (!hasMoreData) {
              dispatch(updateHasMoreData(true));
            }
          } else {
            dispatch(updateHasMoreData(false));
          }
        }
      }
    } catch (err) {
      console.error("UsersTagBox: ", err);
    }
  };

  const tagUser = (user) => {
    addEvent({
      event: "tag_user",
      payload: {
        searchValue: searchValue,
        userId: user._id,
      },
    });
    dispatch(
      updatePostInfo({
        ...postInfo,
        usersTag: [
          ...postInfo.usersTag,
          {
            searchValue: searchValue,
            username: user.username,
            userId: user._id,
          },
        ],
      })
    );
    setOpenTagBox(false);
  };

  return (
    <>
      {isLoading && (
        <div className="users-tag-box__loading">
          <Spinner size="sm" />
        </div>
      )}
      <InfiniteScroll
        queryFc={(page) => {
          handleGetUsersTag({ page });
        }}
        data={users}
        cpnFc={(user) => (
          <UserBox
            user={user}
            isTagBox={true}
            setOpenTagBox={setOpenTagBox}
            searchValue={debounceValue}
            onClick={(user) => tagUser(user)}
          />
        )}
        condition={!!userInfo._id}
        deps={[userInfo._id, debounceValue]}
        skeletonCpn={<UserBoxSekeleton smallAvatar={true} />}
        reloadPageDeps={[debounceValue]}
      />
      {users?.length === 0 && !isLoading && (
        <Text textAlign={"center"}>There is no user</Text>
      )}
    </>
  );
};

export default memo(UsersTagBox);
