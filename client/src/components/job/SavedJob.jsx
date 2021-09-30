import moment from "moment";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { LocationOn, VerifiedUser } from "@material-ui/icons";
import { jobRequestStyles } from "./styles";

import SaveJobBtn from "./SaveJobBtn";

const SavedJob = ({ job, setIsUnsave }) => {
  const classes = jobRequestStyles();
  const { title, description, employer, pay, createdAt, _id, jobStatus } =
    job.job;
  const { location, payment } = employer;
  const { averageScore } = employer.rating;

  return (
    <div className={classes.jobRequestContainer}>
      <div className={classes.left}>
        <Link
          to={`/find-work/jobs/details/${_id}`}
          className={classes.jobRequestLink}
        >
          <div className={classes.texts}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body1">
              {description.slice(0, 310)}
              &nbsp;
              <Link to={`/find-work/jobs/details/${_id}`}>Read More</Link>
            </Typography>
          </div>
        </Link>
        <div className={classes.ratingsTagsContainer}>
          <div style={{ marginTop: "12px" }}>
            <Rating
              name="disabled"
              value={averageScore}
              precision={0.5}
              disabled
            />
          </div>
          <div className={classes.locationContainer}>
            <Typography variant="body1" style={{ marginTop: "13px" }}>
              <LocationOn />
            </Typography>
            <Typography variant="body1" style={{ marginTop: "18px" }}>
              {location.country}
            </Typography>
          </div>
          <div style={{ display: "flex", marginTop: "2%" }}>
            {payment.isVerified && <VerifiedUser />}
          </div>

          <div className={classes.iconsContainer}>
            <SaveJobBtn jobId={_id} />
          </div>
        </div>
      </div>
      <Link
        to={`/find-work/jobs/details/${_id}`}
        className={classes.jobRequestLink}
      >
        <div className={classes.right}>
          <div className={classes.upperRight}></div>
          <div className={classes.lowerRight}></div>
          <div className={classes.lower}>
            <div className={classes.typeContainer}>
              <Typography variant="h6">Type</Typography>
              <Typography variant="body2">
                <strong>{pay.type === "fixed" ? "Fixed" : "Hourly"}</strong>
              </Typography>
            </div>
            <div className={classes.budgetContainer}>
              {pay.type === "fixed" ? (
                <>
                  <Typography variant="h6">Est. Budget</Typography>
                  <Typography variant="body2">
                    <strong>${pay.price.amount}</strong>
                  </Typography>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className={classes.lowerRight}>
            <div className={classes.spentContainer}>
              <Typography variant="body1">
                <i>
                  Job Status:{" "}
                  <strong>
                    {jobStatus === "opened" ? "Opened" : "Closed"}
                  </strong>
                </i>
              </Typography>
              <Typography
                variant="body1"
                style={{
                  top: "85%",
                  position: "relative",
                }}
              >
                Posted <strong>{moment(createdAt).fromNow()}</strong>
              </Typography>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SavedJob;
