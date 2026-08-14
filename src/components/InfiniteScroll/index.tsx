import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { GridItem } from "../ui/primitives";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { updateHasMoreData } from "../../store/UtilSlice";

const InfiniteScroll = ({
  queryFc,
  data,
  cpnFc,
  deps = [],
  condition = true,
  skeletonCpn,
  hasInitialFetch,
  reloadPageDeps = null,
  preloadIndex = 5,
  reverseScroll = false,
  elementId,
  updatePageValue,
  gridColSpan = -1,
}: {
  queryFc: Function;
  data: any;
  cpnFc: any;
  deps?: any;
  condition?: boolean;
  skeletonCpn?: any;
  hasInitialFetch?: boolean;
  reloadPageDeps?: any;
  preloadIndex?: number;
  reverseScroll?: boolean;
  elementId?: string;
  updatePageValue?: number;
  gridColSpan?: number;
}) => {
  const dispatch = useAppDispatch();
  const hasMoreData = useAppSelector((state) => state.util.hasMoreData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScrollY, setCurrentScrollY] = useState<number>();
  const [updatePageWithoutLoad, setUpdatePageWithoutLoad] =
    useState<boolean>(false);
  const observer = useRef<IntersectionObserver>();
  const isFirstRender = useRef<boolean>(true);
  const prevPage = useRef<number>(page);

  const shouldInitialFetch =
    hasInitialFetch !== undefined
      ? hasInitialFetch
      : !data || data.length === 0;

  const lastUserElementRef = useCallback(
    (node) => {
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreData &&
          !reverseScroll &&
          !isLoading
        ) {
          setPage((prevPage) => prevPage + 1);
          // setIsLoading(true);
        }
      });
      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMoreData, isLoading, reverseScroll],
  );

  useEffect(() => {
    if (condition && !updatePageWithoutLoad) {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevPage.current = page;
        if (shouldInitialFetch) {
          queryFc && queryFc(page);
        }
      } else if (page !== prevPage.current) {
        prevPage.current = page;
        queryFc && queryFc(page);
      }
    }
    setIsLoading(false);
    setUpdatePageWithoutLoad(false);
    if (reverseScroll && elementId) {
      const containerEle = document.getElementById(elementId);
      if (containerEle) {
        const listenScroll = () => {
          if (containerEle.scrollTop === 0) {
            setPage((prev) => prev + 1);
            setCurrentScrollY(containerEle.scrollHeight);
          }
        };
        containerEle.addEventListener("scroll", listenScroll);
        return () => {
          containerEle.removeEventListener("scroll", listenScroll);
        };
      }
    }
  }, [
    page,
    condition,
    shouldInitialFetch,
    updatePageWithoutLoad,
    reverseScroll,
    elementId,
  ]);

  useEffect(
    () => {
      if (!!reloadPageDeps && reloadPageDeps?.length > 0) {
        if (page !== 1) {
          setIsLoading(true);
          setPage(1);
          prevPage.current = 1;
          dispatch(updateHasMoreData(true));
        }
      }
    },
    reloadPageDeps ? reloadPageDeps : [],
  );

  useEffect(() => {
    if (reverseScroll && currentScrollY && elementId) {
      const containerEle = document.getElementById(elementId);
      if (containerEle) {
        containerEle.scrollTo({
          top: containerEle.scrollHeight - currentScrollY,
        });
        setCurrentScrollY(0);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!!updatePageValue && updatePageValue !== page) {
      setPage(updatePageValue);
      setUpdatePageWithoutLoad(true);
    }
  }, [updatePageValue]);

  return (
    <>
      {isLoading ? (
        <>
          {skeletonCpn && (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div>{skeletonCpn}</div>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {data?.map((ele, index) => {
            if (
              (data.length >= preloadIndex
                ? index === data.length - preloadIndex
                : index === data.length - 1) &&
              !reverseScroll
            ) {
              if (gridColSpan !== -1) {
                return (
                  <GridItem colSpan={gridColSpan} ref={lastUserElementRef}>
                    {cpnFc(ele, index)}
                  </GridItem>
                );
              }

              return <div ref={lastUserElementRef}>{cpnFc(ele, index)}</div>;
            } else if (index === data.length - 1) {
              if (gridColSpan !== -1) {
                return (
                  <GridItem colSpan={gridColSpan}>
                    {cpnFc(ele, index)}
                    {hasMoreData && !reverseScroll && (
                      <>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div>{skeletonCpn}</div>
                        ))}
                      </>
                    )}
                  </GridItem>
                );
              }
              return (
                <Fragment>
                  {cpnFc(ele, index)}
                  {hasMoreData && !reverseScroll && (
                    <>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div>{skeletonCpn}</div>
                      ))}
                    </>
                  )}
                </Fragment>
              );
            } else {
              return <Fragment>{cpnFc(ele, index)}</Fragment>;
            }
          })}
        </>
      )}
    </>
  );
};

export default memo(InfiniteScroll);
