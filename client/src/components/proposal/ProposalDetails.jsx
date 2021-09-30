import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import {
  Typography,
  Paper,
  Button,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { VerifiedUser, LocationOn, AttachFile } from "@material-ui/icons";

import DialogBox from "../UI/dialog-box/DialogBox";
import { proposalStyles } from "./styles";
import { PROPOSAL_ADDITIONAL_FILES_URL } from "../../helpers/helper";

const ProposalDetails = ({
  proposal,
  open,
  handleClose,
  handleClickOpen,
  handleWithdraw,
  loading,
  handleEditProposal,
}) => {
  const { job, bidType, coverLetter, additionalFiles } = proposal;
  const classes = proposalStyles();

  let jobComp = null;
  if (job) {
    const {
      _id,
      title,
      category,
      description,
      proposals,
      expertise,
      hired,
      employer,
      createdAt,
      projectType,
      pay,
      jobStatus,
      projectLengthInHours,
    } = job;

    const { location, rating, payment, totalMoneySpent } = employer;
    let skills = [];
    let expertiseLevel;
    if (expertise) {
      skills = expertise.skills;
      expertiseLevel = expertise.expertiseLevel;
    }

    jobComp = (
      <>
        <div className={classes.detailContainer}>
          <div>
            {" "}
            <Typography variant="h5">Job details</Typography>
          </div>
          <div>
            <Typography variant="h6">{title}</Typography>
            <Typography
              variant="subtitle2"
              style={{ marginTop: "7px", color: "#303f9f" }}
            >
              <i>{category}</i>
            </Typography>
            <Typography
              variant="body1"
              style={{ top: "12px", position: "relative", marginBottom: "5px" }}
            >
              Posted <strong>{moment(createdAt).fromNow()}</strong>
            </Typography>
          </div>
          <div>
            <pre
              style={{
                whiteSpace: "pre-line",
                lineHeight: "20px",
              }}
            >
              <Typography variant="subtitle1">
                {" "}
                {description.slice(0, 310)}..... &nbsp;
                <Link to={`/find-work/jobs/details/${_id}`}>
                  View job posting
                </Link>
              </Typography>
            </pre>
          </div>
          <div className={classes.tagsContainer}>
            {skills.map((skill) => (
              <Typography variant="body2" key={skill}>
                {skill}
              </Typography>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1">
              Expertise Level: <b>{expertiseLevel}</b>
            </Typography>

            <Typography variant="subtitle1">
              Project Type:{" "}
              <b>
                {projectType === "ongoing"
                  ? "On-going project"
                  : "One-time project"}
              </b>
            </Typography>
            <Typography variant="subtitle1">
              Project Length:{" "}
              <b>{Math.round(projectLengthInHours / 24)} days</b>
            </Typography>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {pay.type === "fixed" ? (
              <>
                <Typography variant="subtitle1">
                  Est. Budget: <strong>${pay.price.amount}</strong>
                </Typography>
                <Typography variant="subtitle1">
                  Pay Type: <b>Fixed</b>
                </Typography>
                <Typography variant="subtitle1">
                  Status: <strong>{jobStatus}</strong>
                </Typography>
              </>
            ) : (
              <>
                {" "}
                <Typography variant="subtitle1">Hourly Rate</Typography>
                <Typography variant="subtitle1">
                  <strong>Min. ${pay.price.minRate}</strong>
                  <strong>Min. ${pay.price.maxRate}</strong>
                </Typography>
                <Typography variant="subtitle1" style={{ marginLeft: "10%" }}>
                  Pay Type: <b>Hourly</b>
                </Typography>
                <Typography variant="subtitle1">
                  Status: <strong>${jobStatus}</strong>
                </Typography>
              </>
            )}
          </div>
          <div className={classes.coverLetterContainer}>
            {" "}
            <div>
              <Typography variant="h5" style={{ marginBottom: "10px" }}>
                Cover letter
              </Typography>{" "}
            </div>
            <pre
              style={{
                marginTop: "30px",
                whiteSpace: "pre-line",
                lineHeight: "20px",
              }}
            >
              <Typography variant="subtitle1">{coverLetter}</Typography>
            </pre>
            {additionalFiles &&
              additionalFiles.map((file, idx) => (
                <div
                  style={{
                    marginTop: "4px",
                    borderBottom: "0px",
                    display: "flex",
                    justifyContent: "left",
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingTop: 0,
                  }}
                  key={idx}
                >
                  <AttachFile fontSize="small" color="primary" />{" "}
                  <a
                    href={PROPOSAL_ADDITIONAL_FILES_URL + `${file.filename}`}
                    style={{ color: "#303f9f" }}
                    download
                  >
                    <Typography variant="body2"> {file.filename}</Typography>
                  </a>
                </div>
              ))}
          </div>
        </div>
        <div>
          <div className={classes.clientInfo}>
            <Typography variant="h6">About the client</Typography>
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              {payment.isVerified && <VerifiedUser />}{" "}
              <Typography
                variant="body1"
                style={{ marginLeft: "6px", marginTop: "2px" }}
              >
                {payment.isVerified
                  ? "Payment is verified"
                  : "Payment method not verified"}
              </Typography>
            </div>
            <div
              style={{
                marginTop: "13px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              <LocationOn />{" "}
              <Typography
                variant="body1"
                style={{ marginLeft: "6px", marginTop: "2px" }}
              >
                {" "}
                {location.country}
              </Typography>
            </div>
            <div
              style={{
                marginTop: "13px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              {" "}
              <Rating
                name="disabled"
                value={rating.averageScore}
                precision={0.5}
                disabled
              />
              <Typography variant="body1" style={{ marginTop: "2px" }}>
                {" "}
                ({rating.rateCounts}{" "}
                {rating.rateCounts <= 1 ? "review" : "reviews"})
              </Typography>
            </div>
            <div
              style={{
                marginTop: "13px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              <Typography variant="body1" style={{ marginTop: "2px" }}>
                <i>${totalMoneySpent.amount / 1000}k+ spent</i>
              </Typography>
            </div>
            <div
              style={{
                marginTop: "13px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              <Typography variant="body1">
                Member since: <b>{moment(createdAt).format("ll")}</b>{" "}
              </Typography>
            </div>
          </div>
          <div className={classes.activity}>
            <Typography variant="h6">Activity on job</Typography>
            <div style={{ marginTop: "15px" }}>
              <Typography variant="body1">
                Number of proposals: <b>{proposals.length}</b>
              </Typography>
            </div>
            <div style={{ marginTop: "13px" }}>
              <Typography variant="body1">
                Number of hired people: <b>{hired.length}</b>
              </Typography>
            </div>
          </div>

          <div className={classes.terms}>
            <Typography variant="h6">Your proposed terms</Typography>
            {bidType === "fixed" ? (
              <div style={{ marginTop: "13px" }}>
                <Typography variant="body1">
                  {" "}
                  Fixed Amount :{" "}
                  <strong>${proposal.fixedBidAmount.amount}</strong>
                </Typography>
                <Typography variant="body1" style={{ color: "#303f9f" }}>
                  <i>( The estimated amount you'll receive )</i>
                </Typography>
              </div>
            ) : (
              <div style={{ marginTop: "13px" }}>
                <Typography variant="body1">
                  Hourly Rate:{" "}
                  <strong>${proposal.hourlyBidAmount.amount}</strong>{" "}
                </Typography>
                <Typography variant="body1" style={{ color: "#303f9f" }}>
                  <i>( The estimated amount you'll receive )</i>
                </Typography>
              </div>
            )}
          </div>
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditProposal}
            >
              Change Terms
            </Button>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleClickOpen}
            >
              Withdraw Proposal
            </Button>
          </div>
        </div>
      </>
    );
  }
  return (
    <Paper className={classes.proposalContainer}>
      {" "}
      {jobComp}{" "}
      <DialogBox
        open={open}
        handleClose={handleClose}
        handleConfirm={handleWithdraw}
        loading={loading}
        confirmBtnTxt="Withdraw Proposal"
      >
        <DialogTitle id="responsive-dialog-title">
          Do you really want to withdraw this proposal?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            We will politely notify the client that you are not interested. Once
            this step is completed you cannot undo this process.
          </DialogContentText>
        </DialogContent>
      </DialogBox>
    </Paper>
  );
};

export default ProposalDetails;
