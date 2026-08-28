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
  // Guards against the IntersectionObserver firing again (fast scroll / slow
  // network) before the in-flight page fetch's result has actually landed in
  // `data` — queryFc is fire-and-forget (not awaited), so without this a
  // second/third page could be requested before the first resolves, and
  // out-of-order responses could merge into the list in the wrong order.
  // 15s safety-release covers the (pre-existing, unrelated) case where the
  // fetch fails and `data` never changes, so scrolling isn't permanently
  // blocked for that list instance.
  const isFetchInFlight = useRef<boolean>(false);

  const shouldInitialFetch =
    hasInitialFetch !== undefined
      ? hasInitialFetch
      : !data || data.length === 0;

  const lastUserElementRef = useCallback(
    (node) => {
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMoreData &&
            !reverseScroll &&
            !isLoading &&
            !isFetchInFlight.current
          ) {
            setPage((prevPage) => prevPage + 1);
            // setIsLoading(true);
          }
        },
        // Fetch the next page ~1 viewport height before the sentinel actually
        // enters view, instead of only once it's already on-screen — gives
        // slow networks a head start so the skeleton fallback (rendered
        // below the sentinel) is less likely to actually be seen mid-scroll.
        { rootMargin: "800px 0px" },
      );
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
        isFetchInFlight.current = true;
        queryFc && queryFc(page);
        setTimeout(() => {
          isFetchInFlight.current = false;
        }, 15000);
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
    isFetchInFlight.current = false;
  }, [data]);

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
                <div key={num}>{skeletonCpn}</div>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {data?.map((ele, index) => {
            const itemKey = ele?._id ?? index;
            if (
              (data.length >= preloadIndex
                ? index === data.length - preloadIndex
                : index === data.length - 1) &&
              !reverseScroll
            ) {
              if (gridColSpan !== -1) {
                return (
                  <GridItem key={itemKey} colSpan={gridColSpan} ref={lastUserElementRef}>
                    {cpnFc(ele, index)}
                  </GridItem>
                );
              }

              return (
                <div key={itemKey} ref={lastUserElementRef}>
                  {cpnFc(ele, index)}
                </div>
              );
            } else if (index === data.length - 1) {
              if (gridColSpan !== -1) {
                return (
                  <GridItem key={itemKey} colSpan={gridColSpan}>
                    {cpnFc(ele, index)}
                    {hasMoreData && !reverseScroll && (
                      <>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <div key={num}>{skeletonCpn}</div>
                        ))}
                      </>
                    )}
                  </GridItem>
                );
              }
              return (
                <Fragment key={itemKey}>
                  {cpnFc(ele, index)}
                  {hasMoreData && !reverseScroll && (
                    <>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num}>{skeletonCpn}</div>
                      ))}
                    </>
                  )}
                </Fragment>
              );
            } else {
              return <Fragment key={itemKey}>{cpnFc(ele, index)}</Fragment>;
            }
          })}
        </>
      )}
    </>
  );
};

export default memo(InfiniteScroll);
