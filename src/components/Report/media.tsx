import { CloseIcon } from "@chakra-ui/icons";
import { Container, Flex, Image } from "@chakra-ui/react";
import { Constants } from "../../Breads-Shared/Constants";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { AppState } from "../../store";
import { updateReportInfo } from "../../store/ReportSlice";

const ReportMediaDisplay = () => {
  const dispatch = useAppDispatch();
  const media = useAppSelector(
    (state: AppState) => state.report.reportInfo.media
  );

  const handleRemoveMedia = (removedIndex: number) => {
    const newMedia = media.filter((item, index) => index !== removedIndex);
    dispatch(
      updateReportInfo({
        key: "media",
        value: newMedia,
      })
    );
  };

  return (
    <Flex gap={2}>
      {media?.map(({ url, type }, index) => {
        const isImg = type === Constants.MEDIA_TYPE.IMAGE;
        if (isImg) {
          return (
            <Container
              m={0}
              p={0}
              pos={"relative"}
              maxH={"150px"}
              maxW={"150px"}
            >
              <Image src={url} maxH={"150px"} maxW={"150px"} alt="Report media" />
              <CloseIcon
                pos={"absolute"}
                top={"-6px"}
                right={"-6px"}
                w={"12px"}
                h={"12px"}
                cursor={"pointer"}
                onClick={() => handleRemoveMedia(index)}
              />
            </Container>
          );
        } else {
          return (
            <video
              src={url}
              style={{
                maxHeight: "150px",
              }}
            />
          );
        }
      })}
    </Flex>
  );
};

export default ReportMediaDisplay;
