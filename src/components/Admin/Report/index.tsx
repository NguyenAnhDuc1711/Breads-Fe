import { Button, Text } from "../../ui/primitives";
import { Fade } from "../../ui/primitives";
import MDEditor from "@uiw/react-md-editor";
import * as marked from "marked";
import { useState } from "react";
import { REPORT_PATH, Route } from "../../../Breads-Shared/APIConfig";
import { PATCH } from "../../../config/API";
import { useAppSelector } from "../../../hooks/redux";
import { AppState } from "../../../store";
import MediaDisplay from "../../PostPopup/mediaDisplay";
import UserBox from "../../UserFollowBox/UserBox";
import "./index.css";

const ReportBox = ({
  report,
  selectedReport,
  setSelectedReport,
  reports,
  setReports,
}) => {
  const userInfo = useAppSelector((state: AppState) => state.user.userInfo);
  const { content, media, userReport } = report;
  const [res, setRes] = useState("");

  const updateNewList = () => {
    const newReports = reports?.filter(({ _id }) => _id !== report?._id);
    setReports(newReports);
  };

  // Task 021 (D-1): POST /reports/reject -> PATCH /reports/:id/reject (id path, T014).
  const handleReject = async () => {
    const payload = {
      userId: userInfo?._id,
    };
    await PATCH({
      path: Route.REPORT + REPORT_PATH.REJECT.replace(":id", report?._id),
      payload,
    });
    updateNewList();
  };

  // Task 021 (D-1): POST /reports/response -> PATCH /reports/:id/response (id path, T014).
  const handleSendMail = async () => {
    const htmlConverted = marked.parse(res);
    const payload = {
      from: "mraducky@gmail.com",
      to: report.userReport?.email,
      subject: "Thanks for reporting the problem",
      html: htmlConverted,
      userId: userInfo?._id,
    };
    await PATCH({
      path: Route.REPORT + REPORT_PATH.RESPONSE.replace(":id", report?._id),
      payload,
    });
    setSelectedReport(null);
    updateNewList();
  };

  const reportContainer = () => {
    return (
      <div className="admin-report__panel">
        <UserBox user={userReport} inFollowBox={true} />
        <Text className="admin-report__content">{content}</Text>
        {!!media && media?.length > 0 && <MediaDisplay media={media} />}
        <div className="admin-report__actions">
          <Button className="btn-subtle" flex={1} onClick={() => handleReject()}>
            Reject
          </Button>
          <Button
            flex={1}
            bg={"green"}
            onClick={() => setSelectedReport(report)}
          >
            Response
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-report">
      {selectedReport?._id === report?._id ? (
        <>
          {reportContainer()}
          <Fade in={true}>
            <div className="admin-report__editor-wrap">
              <MDEditor
                value={res}
                onChange={(value) => setRes(value as string)}
                preview="edit"
                height={300}
                style={{ overflow: "hidden" }}
                textareaProps={{
                  placeholder:
                    "Briefly describe your idea and what problem it solves",
                }}
                previewOptions={{
                  disallowedElements: ["style"],
                }}
              />
              <div className="admin-report__actions admin-report__actions--reply">
                <Button className="btn-subtle" flex={1} onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
                <Button flex={1} bg={"green"} onClick={() => handleSendMail()}>
                  Send mail
                </Button>
              </div>
            </div>
          </Fade>
        </>
      ) : (
        <>{reportContainer()}</>
      )}
    </div>
  );
};

export default ReportBox;
