import moment from "moment";
import { Link } from "react-router-dom";
import { Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { LocationOn, VerifiedUser } from "@material-ui/icons";
import { jobRequestStyles } from "../styles";

const JobRequest = ({ job }) => {
  const classes = jobRequestStyles();
  const {
    _id,
    title,
    description,
    employer,
    expertise,
    proposals,
    projectLengthInHours,
    pay,
    createdAt,
  } = job;
  const { location, payment, totalMoneySpent } = employer;
  const { averageScore } = employer.rating;
  const { skills, expertiseLevel } = expertise;
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
          <div className={classes.ratings}>
            <Rating
              name="disabled"
              value={averageScore}
              precision={0.5}
              disabled
            />
          </div>
          <div className={classes.tagsContainer}>
            {skills.map((skill) => (
              <Typography variant="body2" key={skill}>
                {skill}
              </Typography>
            ))}
          </div>
          <div className={classes.locationContainer}>
            <LocationOn fontSize="large" />
            <Typography variant="body1" style={{ marginTop: "13px" }}>
              {location.country}
            </Typography>
          </div>
          <div className={classes.proposalContainer}>
            <Typography variant="body1" style={{ marginTop: "13px" }}>
              Proposals: {proposals.length}
            </Typography>
          </div>
          <div className={classes.verifyContainer}>
            {payment.isVerified && <VerifiedUser />}
          </div>
        </div>
      </div>
      <Link
        to={`/find-work/jobs/details/${_id}`}
        className={classes.jobRequestLink}
      >
        <div className={classes.right}>
          <div className={classes.upperRight}>
            <div className={classes.timeContainer}>
              <Typography variant="h6">Est. Time</Typography>
              <Typography variant="body2">
                <strong>{projectLengthInHours} hours</strong>
              </Typography>
            </div>
            <div className={classes.levelContainer}>
              <Typography variant="h6">Level</Typography>
              <Typography variant="body2">
                <strong>{expertiseLevel}</strong>
              </Typography>
            </div>
          </div>
          <div className={classes.lowerRight}>
            <div className={classes.spentContainer}>
              <Typography variant="body1">
                <i>${totalMoneySpent.amount / 1000}k+ spent</i>
              </Typography>
            </div>
          </div>
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
                Posted <strong>{moment(new Date(createdAt)).fromNow()}</strong>
              </Typography>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobRequest;
