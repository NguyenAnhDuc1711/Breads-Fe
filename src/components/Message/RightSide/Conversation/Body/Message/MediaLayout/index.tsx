import { Container, Flex, Image, Text } from "@chakra-ui/react";
import { useAppDispatch } from "../../../../../../../hooks/redux";
import { updateSeeMedia } from "../../../../../../../store/UtilSlice";

const MsgMediaLayout = ({ media }: { media: any }) => {
  const dispatch = useAppDispatch();

  const handleSeeMedia = (index) => {
    dispatch(
      updateSeeMedia({
        open: true,
        media: media,
        currentMediaIndex: index,
      })
    );
  };

  const mediaLen = media.length;
  switch (mediaLen) {
    case 1:
      return (
        <Image
          mr={2}
          src={media[0].url}
          height={"auto"}
          maxHeight={"200px"}
          maxWidth={"35vw"}
          objectFit={"cover"}
          borderRadius={4}
          cursor={"pointer"}
          alt="Message media"
          onClick={() => {
            handleSeeMedia(0);
          }}
        />
      );
    case 2:
    case 3:
      return (
        <Flex
          gap={2}
          height={"auto"}
          maxHeight={"180px"}
          maxWidth={"35vw"}
          mr={2}
        >
          {media.map(({ url }, index) => (
            <Image
              maxWidth={"15vw"}
              key={url}
              src={url}
              objectFit={"cover"}
              borderRadius={4}
              cursor={"pointer"}
              alt={`Message media ${index + 1}`}
              onClick={() => {
                handleSeeMedia(index);
              }}
            />
          ))}
        </Flex>
      );
    default:
      return (
        <Flex wrap={"wrap"} gap={2} mr={2} maxWidth={"35vw"}>
          {media.map(({ url }, index) => {
            if (index < 4) {
              return (
                <Image
                  height={"auto"}
                  maxHeight={"140px"}
                  width={mediaLen === 4 ? "20vw" : "10vw"}
                  flex={1}
                  key={url}
                  src={url}
                  objectFit={"cover"}
                  borderRadius={4}
                  cursor={"pointer"}
                  alt={`Message media ${index + 1}`}
                  onClick={() => {
                    handleSeeMedia(index);
                  }}
                />
              );
            } else if (index === 4) {
              return (
                <Container
                  p={0}
                  margin={0}
                  position={"relative"}
                  height={"auto"}
                  maxHeight={"140px"}
                  width={mediaLen === 4 ? "20vw" : "10vw"}
                  flex={1}
                  key={url}
                  borderRadius={4}
                  overflow={"hidden"}
                  onClick={() => {
                    handleSeeMedia(index);
                  }}
                >
                  <Image
                    position={"absolute"}
                    left={0}
                    top={0}
                    src={url}
                    objectFit={"cover"}
                    alt={`Message media ${index + 1}`}
                  />
                  {mediaLen - 5 > 0 && (
                    <Flex
                      p={0}
                      margin={0}
                      position={"absolute"}
                      left={0}
                      top={0}
                      width={"100%"}
                      height={"100%"}
                      backgroundColor={"rgba(128, 128, 128, 0.600)"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      cursor={"pointer"}
                    >
                      <Text fontSize={"24px"} color={"white"} fontWeight={700}>
                        +{mediaLen - 5}
                      </Text>
                    </Flex>
                  )}
                </Container>
              );
            }
          })}
        </Flex>
      );
  }
};

export default MsgMediaLayout;
