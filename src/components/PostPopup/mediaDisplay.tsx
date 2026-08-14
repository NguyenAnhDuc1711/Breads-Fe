"use client";

import { CloseIcon } from "../../assests/chakraIcons";
import { Button } from "../ui/primitives";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Constants } from "../../Breads-Shared/Constants";
import PostConstants from "../../Breads-Shared/Constants/PostConstants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { IPost, selectPost, updatePostInfo } from "../../store/PostSlice";
import { updateSeeMedia } from "../../store/UtilSlice";
import "./mediaDisplay.css";

const MediaDisplay = ({
  post,
  isDetail,
  media,
  isFirst = false,
}: {
  post?: IPost;
  isDetail?: boolean;
  media?: any;
  isFirst?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const postAction = useAppSelector((state: AppState) => state.post.postAction);
  const mediaContainerRef = useRef<any>(null);
  const isDragging = useRef(false);
  const startPosition = useRef(0);
  const scrollPosition = useRef(0);
  const velocity = useRef(0);
  const [momentum, setMomentum] = useState(false);
  const mediaDisplay = !!post ? post.media : media;

  const handleSeeFullMedia = (media, index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: media,
        currentMediaIndex: index,
      })
    );
    //Temp
    dispatch(selectPost(post));
  };

  const handleRemoveMedia = (indexToRemove) => {
    const updatedMedia = mediaDisplay.filter(
      (_, index) => index !== indexToRemove
    );
    dispatch(updatePostInfo({ ...post, media: updatedMedia }));
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    momentum && setMomentum(false);
    startPosition.current = e.pageX - mediaContainerRef.current?.offsetLeft;
    scrollPosition.current = mediaContainerRef.current?.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !mediaContainerRef.current) return;
    const currentPosition = e.pageX - mediaContainerRef.current.offsetLeft;
    const distance = currentPosition - startPosition.current;
    velocity.current = distance;
    mediaContainerRef.current.scrollLeft = scrollPosition.current - distance;
  };

  const handleMouseUp = (e) => {
    isDragging.current = false;
    startMomentumScroll(e);
  };

  const handleMouseLeave = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      startMomentumScroll(e);
    }
  };

  const startMomentumScroll = (e) => {
    e.preventDefault();
    if (!mediaContainerRef.current) return;
    let momentumVelocity = velocity.current;
    if (momentumVelocity !== 0) {
      setMomentum(true);
      const inertiaInterval = setInterval(() => {
        if (!mediaContainerRef.current) {
          clearInterval(inertiaInterval);
          return;
        }
        mediaContainerRef.current.scrollLeft -= momentumVelocity * 0.95;
        momentumVelocity *= 0.95;
        if (Math.abs(momentumVelocity) < 0.5) {
          clearInterval(inertiaInterval);
          setMomentum(false);
        }
      }, 16);
    }
  };
  const handleSeeDetail = () => {
    router.push(`/posts/${post?._id}`);
  };

  return (
    mediaDisplay?.length > 0 && (
      <div
        className={`no-scrollbar post-media ${
          mediaDisplay?.length <= 2 ? "post-media--wrap" : "post-media--nowrap"
        } ${
          mediaDisplay?.length > 2
            ? "post-media--scroll"
            : "post-media--hidden-x"
        } ${
          isDragging.current || momentum
            ? "post-media--grabbing"
            : "post-media--grab"
        }`}
        onClick={() => {
          const { REPOST, CREATE, REPLY, EDIT } = PostConstants.ACTIONS;
          if (![REPOST, CREATE, REPLY, EDIT].includes(postAction) && !isDetail) {
            handleSeeDetail();
          }
        }}
        ref={mediaContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {mediaDisplay.map((media, index) => (
          <div className="post-media__item" key={index}>
            {media.type === Constants.MEDIA_TYPE.VIDEO ? (
              <video
                className="post-media__video"
                src={media.url}
                controls
                onClick={() => {
                  if (!postAction) {
                    handleSeeFullMedia(mediaDisplay, index);
                  }
                }}
              />
            ) : (
              <NextImage
                className="post-media__image"
                src={media.url}
                alt={`Post Media ${index}`}
                width={350}
                height={250}
                priority={isFirst && index === 0}
                loading={isFirst && index === 0 ? undefined : "lazy"}
                onDragStart={(e) => e.preventDefault()}
                onClick={(e) => {
                  if (!postAction) {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSeeFullMedia(mediaDisplay, index);
                  }
                }}
              />
            )}

            {(postAction === PostConstants.ACTIONS.CREATE ||
              postAction === PostConstants.ACTIONS.EDIT) && (
              <Button
                className="post-media__remove-btn"
                onClick={() => handleRemoveMedia(index)}
                size="sm"
              >
                <CloseIcon boxSize="10px" />
              </Button>
            )}
          </div>
        ))}
      </div>
    )
  );
};

export default MediaDisplay;
