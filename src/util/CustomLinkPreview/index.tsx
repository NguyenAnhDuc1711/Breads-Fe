"use client";

import { Skeleton, SkeletonText } from "../../components/ui/primitives";
import axios from "axios";
import { memo, useEffect, useState } from "react";
import { TiDeleteOutline } from "react-icons/ti";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updatePostInfo } from "../../store/PostSlice";
import "./index.css";

const CustomLinkPreview = ({
  link = null,
  url = "", //[]
  bg = "",
  color = "",
  borderColor = "",
}) => {
  const dispatch = useAppDispatch();
  const postInfo = useAppSelector((state: AppState) => state.post.postInfo);
  const postAction = useAppSelector((state: AppState) => state.post.postAction);
  const [data, setData] = useState<any>(link);
  const finalLink = url[url.length - 1];

  useEffect(() => {
    if (!link) {
      if (url) {
        console.log("url: ", url);
        console.log("finalLink: ", finalLink);
        fetchLinkData(url);
      } else if (postInfo?.links.length > 0) {
        setData(postInfo.links[0]);
      }
    }
  }, [url, postInfo?.links?.length]);

  // Calls our own /api/link-preview route instead of api.linkpreview.net
  // directly — the API key(s) now live server-only (LINKPREVIEW_API_KEYS),
  // never sent to or visible in the browser.
  const fetchLinkData = async (fetchUrl) => {
    try {
      const { data } = await axios.get("/api/link-preview", {
        params: { url: fetchUrl },
      });
      if (data && !data.error) {
        setData(data);
        dispatch(
          updatePostInfo({
            ...postInfo,
            links: [...postInfo.links, data],
          })
        );
      }
    } catch (err) {
      console.error("getLinkPreview: ", err);
    }
  };

  const handleDeleteLink = () => {
    const remainingLinks = postInfo.links.filter((link) => link !== data);
    setData(remainingLinks[0]);
    dispatch(
      updatePostInfo({
        ...postInfo,
        links: remainingLinks,
      })
    );
  };
  if (!data)
    return (
      <div className="preview-link-skeleton">
        <Skeleton height="200px" borderRadius="md" />
        <SkeletonText my="4" noOfLines={1} spacing="4" skeletonHeight="3" />
      </div>
    );

  return (
    <div
      className="preview-link-container"
      style={{
        backgroundColor: bg || undefined,
        color: color || undefined,
        border: borderColor ? `1px solid ${borderColor}` : undefined,
      }}
    >
      {postAction === PostConstants.ACTIONS.CREATE && (
        <TiDeleteOutline
          className="link-delete-btn"
          onClick={handleDeleteLink}
        />
      )}

      <h4 className="link-title">{data.title}</h4>

      <a href={data.url} target="_blank" rel="noopener noreferrer">
        {data.image && (
          <>
            <img src={data.image} className="link-img" alt={data.title} />
            <p
              className="link-des"
              style={{
                backgroundColor: bg || undefined,
                color: color || undefined,
              }}
            >
              {data.description?.length > 100
                ? `${data.description.slice(0, 100)}...`
                : data.description}
            </p>
          </>
        )}
      </a>
    </div>
  );
};

export default memo(CustomLinkPreview);
