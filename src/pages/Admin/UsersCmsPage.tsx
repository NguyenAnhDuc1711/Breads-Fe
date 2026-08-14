"use client";

import { Button, Image, Text } from "../../components/ui/primitives";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GET } from "../../config/API";
import { Route, USER_PATH } from "../../Breads-Shared/APIConfig";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { Constants } from "../../Breads-Shared/Constants";
import { updateUser } from "../../store/UserSlice/asyncThunk";
import PaginationBtn from "../../components/PaginationBtn";
import useDebounce from "../../hooks/useDebounce";
import "./UsersCmsPage.css";

const convertUserStatus = (status: number) => {
  const { ACTIVE, INACTIVE, LOCK, BANNED } = Constants.USER_STATUS;
  switch (status) {
    case ACTIVE:
      return "Active";
    case INACTIVE:
      return "Inactive";
    case LOCK:
      return "Lock";
    case BANNED:
      return "Banned";
    default:
      return "";
  }
};

const UsersCmsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const rowsPerPage = 7;
  const props = ["name", "username", "avatar", "status", "action"];
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const [users, setUsers] = useState<any>();
  const [searchValue, setSearchValue] = useState("");
  const debounceSearch = useDebounce(searchValue);
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = useRef(0);
  const totalPages = Math.ceil(totalRows.current / rowsPerPage);

  useEffect(() => {
    handleGetUserByPage(currentPage, searchValue);
  }, [currentPage, debounceSearch]);

  const handleGetUserByPage = async (page: number, searchValue: string) => {
    try {
      const data: any = await GET({
        path: Route.USER + USER_PATH.GET_USERS_WITH_STATUS,
        params: {
          userId: userInfo?._id,
          page,
          limit: rowsPerPage,
          searchValue,
        },
      });
      setUsers(data?.users);
      totalRows.current = data?.count;
    } catch (err) {
      console.error("handleGetUserByPage: ", err);
    }
  };

  const handleUpdateUserStatus = async ({
    userId,
    status,
  }: {
    userId: string;
    status: number;
  }) => {
    try {
      const payload = {
        userId,
        status,
      };
      dispatch(updateUser(payload));
    } catch (err) {
      console.error("handleUpdateUserStatus: ", err);
    }
  };

  return (
    <div className="container-fluid">
      <div className="my-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>
      <div className="users-cms-page__table-wrap">
        <table className="table table-striped table-bordered table-responsive">
          <thead
            className="thead-dark"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "white",
            }}
          >
            <tr>
              {props.map((col) => (
                <th
                  key={col}
                  // onClick={() => handleSort("id")}
                  style={{
                    cursor: "pointer",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                    padding: "12px 16px",
                  }}
                >
                  {col}
                  {/* {sortConfig.key === "id" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")} */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users?.length > 0 ? (
              users.map((user: any) => (
                <tr key={user?._id}>
                  <td style={{ minWidth: "120px", maxWidth: "25%" }}>
                    <Text noOfLines={1}>{user?.name}</Text>
                  </td>
                  <td style={{ minWidth: "120px", maxWidth: "20%" }}>
                    <Text noOfLines={1}>{user?.username}</Text>
                  </td>
                  <td style={{ minWidth: "80px", width: "15%" }}>
                    <Image
                      src={user?.avatar}
                      width={"60px"}
                      height={"60px"}
                      objectFit={"cover"}
                      borderRadius="md"
                      cursor={"pointer"}
                      alt={user?.username ? `${user.username}'s avatar` : "User avatar"}
                    />
                  </td>
                  <td style={{ minWidth: "100px", width: "20%" }}>
                    <select
                      defaultValue={user?.status}
                      onChange={(e) =>
                        handleUpdateUserStatus({
                          userId: user?._id,
                          status: Number(e.target.value),
                        })
                      }
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                        padding: "6px",
                        borderRadius: "4px",
                        border: "1px solid #ced4da",
                      }}
                    >
                      {Object.values(Constants.USER_STATUS).map(
                        (status: number) => (
                          <option
                            key={status}
                            value={status}
                            style={{
                              backgroundColor: "white",
                            }}
                          >
                            {convertUserStatus(status)}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td
                    style={{
                      minWidth: "120px",
                      width: "20%",
                      textAlign: "center",
                    }}
                  >
                    <Button
                      size="sm"
                      color="black"
                      border={"1px solid black"}
                      onClick={() => {
                        router.push(`/users/${user?._id}`);
                      }}
                    >
                      See detail
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={props.length} className="text-center">
                  No matching data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-3">
          <PaginationBtn
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </nav>
      )}
    </div>
  );
};

export default UsersCmsPage;
