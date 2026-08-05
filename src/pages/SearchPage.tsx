"use client";

import { Container, Flex, Text, useColorModeValue } from "@chakra-ui/react";
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

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const bgColor = useColorModeValue("cbg.light", "cbg.dark");
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
      if (!userInfo?._id) return;
      try {
        if (!isFetchMore) {
          setLoading(true);
        }
        const data: IUser[] | undefined | null = await GET({
          path: Route.USER + USER_PATH.USERS_TO_FOLLOW,
          params: {
            userId: userInfo._id,
            page: page,
            limit: 20,
            searchValue,
          },
        });
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
    if (userInfo?._id) {
      handleGetUsers({
        page: 1,
        searchValue,
        isFetchMore: false,
      });
    }

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
        <Container
          width="100%"
          maxWidth={"100%"}
          height={"40px"}
          borderRadius={"12px"}
          bg={bgColor}
          margin={0}
          marginBottom={"12px"}
          padding={0}
        >
          <SearchBar
            value={searchValue}
            setValue={setSearchValue}
            placeholder={t("search")}
          />
        </Container>
        <Text
          color={"gray"}
          fontWeight={"500"}
          mb={"12px"}
          position={"relative"}
          left={"4px"}
        >
          {t("Suggested_follow_up")}
        </Text>
        {loading ? (
          <Flex direction="column" gap={3} width="100%">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <UserFollowBoxSkeleton key={`search-skeleton-${num}`} />
            ))}
          </Flex>
        ) : users.length === 0 ? (
          <Flex
            flex={1}
            justifyContent="center"
            alignItems="center"
            width="100%"
            py={6}
          >
            <EmptyContentSvg />
          </Flex>
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
            deps={[userInfo._id, searchValue]}
            skeletonCpn={<UserFollowBoxSkeleton />}
          />
        )}
      </ContainerLayout>
    </>
  );
};

export default SearchPage;
