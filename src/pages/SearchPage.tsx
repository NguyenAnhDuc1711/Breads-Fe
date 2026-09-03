"use client";

import { Text } from "../components/ui/primitives";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH } from "../Breads-Shared/APIConfig";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import { EmptyContentSvg } from "../assests/icons";
import InfiniteScroll from "../components/InfiniteScroll";
import ContainerLayout from "../components/MainBoxLayout";
import SearchBar from "../components/SearchBar";
import UserFollowBox from "../components/UserFollowBox";
import UserFollowBoxSkeleton from "../components/UserFollowBox/skeleton";
import { GET } from "../config/API";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { IUser } from "../store/UserSlice";
import { updateHasMoreData } from "../store/UtilSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import { GA_EVENTS, sendGaEvent } from "../util/gtmEvents";
import "./SearchPage.css";

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const init = useRef(true);

  const handleGetUsers = useCallback(
    async ({
      page,
      searchValue,
      isFetchMore,
    }: {
      page: number;
      searchValue: string;
      isFetchMore: boolean;
    }) => {
      try {
        if (!isFetchMore) {
          setLoading(true);
        }
        const data: IUser[] | undefined | null = await GET({
          path: Route.USER + USER_PATH.USERS_TO_FOLLOW,
          params: {
            ...(userInfo?._id ? { userId: userInfo._id } : {}),
            page: page,
            limit: 20,
            searchValue,
          },
        });
        if (!isFetchMore && searchValue) {
          sendGaEvent({
            event: GA_EVENTS.SEARCH,
            params: { search_term: searchValue },
          });
        }
        if (!!data && data.length > 0) {
          if (isFetchMore) {
            setUsers((prev) => [...prev, ...data]);
          } else {
            setUsers(data);
          }
          dispatch(updateHasMoreData(data.length >= 20));
        } else {
          if (!isFetchMore) {
            setUsers([]);
          }
          dispatch(updateHasMoreData(false));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isFetchMore) {
          setLoading(false);
        }
      }
    },
    [userInfo?._id, dispatch],
  );

  useEffect(() => {
    handleGetUsers({
      page: 1,
      searchValue,
      isFetchMore: false,
    });

    if (init.current) {
      dispatch(changePage({ nextPage: PageConstant.SEARCH }));
      addEvent({
        event: "see_page",
        payload: {
          page: "search",
        },
      });
      init.current = false;
    }
  }, [searchValue, userInfo?._id]);

  return (
    <>
      <ContainerLayout>
        <div className="search-page__search-bar-wrap">
          <SearchBar
            value={searchValue}
            setValue={setSearchValue}
            placeholder={t("search")}
          />
        </div>
        <Text className="search-page__suggested-label">
          {t("Suggested_follow_up")}
        </Text>
        {loading ? (
          <div className="search-page__skeleton-list">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <UserFollowBoxSkeleton key={`search-skeleton-${num}`} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="search-page__empty">
            <EmptyContentSvg />
          </div>
        ) : (
          <InfiniteScroll
            queryFc={(page) => {
              if (page > 1) {
                handleGetUsers({
                  page,
                  searchValue,
                  isFetchMore: true,
                });
              }
            }}
            data={users}
            cpnFc={(user) => <UserFollowBox user={user} />}
            condition={!!userInfo._id}
            skeletonCpn={<UserFollowBoxSkeleton />}
          />
        )}
      </ContainerLayout>
    </>
  );
};

export default SearchPage;
