"use client";

import { Container, Text, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Route, USER_PATH } from "../Breads-Shared/APIConfig";
import PageConstant from "../Breads-Shared/Constants/PageConstants";
import InfiniteScroll from "../components/InfiniteScroll";
import ContainerLayout from "../components/MainBoxLayout";
import SearchBar from "../components/SearchBar";
import UserFollowBox from "../components/UserFollowBox";
import UserFollowBoxSkeleton from "../components/UserFollowBox/skeleton";
import { GET } from "../config/API";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { AppState } from "../store";
import { IUser } from "../store/UserSlice";
import { changePage } from "../store/UtilSlice/asyncThunk";
import { addEvent } from "../util";
import { updateHasMoreData } from "../store/UtilSlice";

const SearchPage = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const bgColor = useColorModeValue("cbg.light", "cbg.dark");
  const textColor = useColorModeValue("ccl.light", "ccl.dark");
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const init = useRef(true);

  useEffect(() => {
    if (!init.current) {
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
    }
    init.current = false;
  }, [searchValue]);

  const handleGetUsers = async ({ page, searchValue, isFetchMore }) => {
    try {
      const data: IUser[] | undefined | null = await GET({
        path: Route.USER + USER_PATH.USERS_TO_FOLLOW,
        params: {
          userId: userInfo._id,
          page: page,
          limit: 20,
          searchValue,
        },
      });
      if (!!data) {
        if (isFetchMore) {
          setUsers([...users, ...data]);
        } else {
          setUsers(data);
        }
        dispatch(updateHasMoreData(true));
      } else {
        dispatch(updateHasMoreData(false));
        // setHasMore && setHasMore(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <InfiniteScroll
          queryFc={(page, setHasMore) => {
            handleGetUsers({
              page,
              searchValue,
              isFetchMore: true,
              // setHasMore,
            });
          }}
          data={users}
          cpnFc={(user) => <UserFollowBox user={user} />}
          condition={!!userInfo._id}
          deps={[userInfo._id]}
          skeletonCpn={<UserFollowBoxSkeleton />}
        />
      </ContainerLayout>
    </>
  );
};

export default SearchPage;
