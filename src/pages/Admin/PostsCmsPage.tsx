"use client";

import { Button, Container, Flex, Image, Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { POST_PATH, Route } from "../../Breads-Shared/APIConfig";
import { Constants } from "../../Breads-Shared/Constants";
import PageConstants from "../../Breads-Shared/Constants/PageConstants";
import Survey from "../../components/ListPost/Post/Survey";
import FileMsg from "../../components/Message/RightSide/Conversation/Body/Message/Files";
import PaginationBtn from "../../components/PaginationBtn";
import { GET } from "../../config/API";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { IPost } from "../../store/PostSlice";
import { updateSeeMedia } from "../../store/UtilSlice";
import { changePage } from "../../store/UtilSlice/asyncThunk";

const PostsCmsPage = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.user.userInfo);
  const props = [
    "author",
    "content",
    "media",
    "files",
    "survey",
    "type",
    "status",
    "statistic",
  ];
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    dispatch(changePage({ nextPage: PageConstants.ADMIN.POSTS }));
    handleGetPosts();
  }, []);

  const handleGetPosts = async () => {
    try {
      const data: any = await GET({
        path: Route.POST + POST_PATH.GET_ALL,
        params: {
          filter: { page: PageConstants.ADMIN.POSTS },
          userId: userInfo._id,
        },
      });
      if (!!data) {
        setPosts(data);
      }
    } catch (err) {
      console.error("handleGetPosts: ", err);
    }
  };

  const tableData = posts?.map(
    ({
      _id,
      authorInfo,
      content,
      media,
      files,
      survey,
      type,
      status,
      replies,
      repostNum,
      likesCount,
    }: any) => ({
      _id,
      author: authorInfo?.username,
      content,
      media,
      files,
      survey,
      type,
      status,
      statistic: {
        like: likesCount ?? 0,
        reply: replies?.length,
        repost: repostNum,
      },
    })
  );

  // State for search, sorting, pagination, and data
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  // Filter data based on search term
  const filteredData = tableData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data based on column and direction
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalRows = posts.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSeeMedia = (media, index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: media,
        currentMediaIndex: index,
      })
    );
  };

  const convertStatus = (status) => {
    const entries = Object.entries(Constants.POST_STATUS);
    const currentStatusStr = entries.find(([str, num]) => num === status)?.[0];
    return currentStatusStr;
  };

  return (
    <div className="container-fluid mt-2">
      <Flex justifyContent={"space-between"} my={2}>
        <h2>Posts CMS</h2>
        <Button
          onClick={() => {
            const newUrl =
              window.location.origin +
              "/" +
              PageConstants.ADMIN.POSTS_VALIDATION;
            history.pushState(null, "", newUrl);
            window.location.reload();
          }}
        >
          Validation
        </Button>
      </Flex>

      {/* Search bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      {/* Table container with responsive scrolling */}
      <Box overflowX="auto" maxHeight="70vh" overflowY="auto">
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
                  onClick={() => handleSort(col)}
                  style={{
                    cursor: "pointer",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                  {sortConfig.key === col &&
                    (sortConfig.direction === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr key={row._id}>
                  <td style={{ minWidth: "80px", maxWidth: "10%" }}>
                    <Text noOfLines={2}>{row.author}</Text>
                  </td>
                  <td style={{ minWidth: "100px", maxWidth: "15%" }}>
                    <Text noOfLines={3}>{row.content}</Text>
                  </td>
                  <td style={{ minWidth: "100px", width: "12%" }}>
                    {row.media.length > 0 && (
                      <Container
                        p={0}
                        style={{
                          position: "relative",
                          width: "100%",
                          cursor: "pointer",
                        }}
                      >
                        {row.media?.[0]?.type === Constants.MEDIA_TYPE.VIDEO ? (
                          <video
                            src={row.media?.[0]?.url}
                            style={{
                              width: "100%",
                              objectFit: "cover",
                              maxHeight: "80px",
                            }}
                            onClick={(e) => {
                              handleSeeMedia(row.media, 0);
                              e.stopPropagation();
                            }}
                          />
                        ) : (
                          <Image
                            src={row.media?.[0]?.url}
                            width={"100%"}
                            objectFit={"cover"}
                            maxHeight={"80px"}
                            cursor={"pointer"}
                            _hover={{
                              opacity: 0.7,
                            }}
                            onClick={(e) => {
                              handleSeeMedia(row.media, 0);
                              e.stopPropagation();
                            }}
                          />
                        )}
                        {row.media.length - 1 > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              color: "white",
                              transform: "translate(-50%, -50%)",
                              cursor: "pointer",
                              zIndex: 0,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            + {row.media.length - 1}
                          </div>
                        )}
                      </Container>
                    )}
                  </td>
                  <td style={{ minWidth: "150px", maxWidth: "15%" }}>
                    <Flex flexDir={"column"} gap={1}>
                      {row.files.map((file, index) => (
                        <FileMsg
                          key={`row-${row._id}-file-${index}`}
                          file={file}
                        />
                      ))}
                    </Flex>
                  </td>
                  <td style={{ minWidth: "150px", width: "15%" }}>
                    <Survey post={row} />
                  </td>
                  <td
                    style={{
                      textTransform: "capitalize",
                      minWidth: "80px",
                      width: "8%",
                    }}
                  >
                    <Text noOfLines={1}>{row.type}</Text>
                  </td>
                  <td
                    style={{
                      textTransform: "capitalize",
                      minWidth: "80px",
                      width: "8%",
                    }}
                  >
                    <Text noOfLines={1}>
                      {convertStatus(row.status)?.toLowerCase()}
                    </Text>
                  </td>
                  <td style={{ minWidth: "90px", width: "10%" }}>
                    {Object.entries(row.statistic).map(([key, value]) => (
                      <p
                        key={`row-${row._id}-statistic-${key}`}
                        style={{
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        {key}: {value}
                      </p>
                    ))}
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
      </Box>

      {/* Pagination */}
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

export default PostsCmsPage;
