import { useToast } from "../../../ui/primitives";
import { IPost } from "../../../../store/PostSlice";

const useCopyLink = () => {
  const toast = useToast();
  const copyURL = (postInfo: IPost): void => {
    const postURL = `${window.location.origin}/posts/${postInfo?._id}`;
    navigator.clipboard.writeText(postURL).then(() => {
      toast({
        title: "",
        description: "Copied",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  return { copyURL };
};

export default useCopyLink;
