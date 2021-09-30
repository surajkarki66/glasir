import React from "react";
import moment from "moment";
import jwt_decode from "jwt-decode";
import { Link } from "react-router-dom";
import { AttachFile } from "@material-ui/icons";
import DialogBox from "../UI/dialog-box/DialogBox";
import StripeCheckout from "react-stripe-checkout";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Paper,
  Button,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

import { WORK_DETAILS_FILE_URL } from "../../helpers/helper";

export const proposalStyles = makeStyles((theme) => ({
  proposalContainer: {
    marginTop: "5px",
    display: "grid",
    gridTemplateColumns: "75% auto",
  },
  detailContainer: {
    borderRight: "1px solid #cec7c6",
    "& div": {
      padding: "3%",
      borderBottom: "1px solid #cec7c6",
    },
  },
  freelancerProposalContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: "2% 0 2% 0",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    padding: "2% 2% 2% 3%",
  },
  tagsContainer: {
    display: "flex",
    "& p": {
      marginRight: "8px",
      backgroundColor: "#a2a2a2",
      padding: "8px 7px 5px 7px",
      borderRadius: "4px",
    },
  },
  clientInfo: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  activity: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  terms: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  buttonContainer: {
    padding: "10%",
    display: "flex",
    flexDirection: "column",

    "& button": {
      marginBottom: "20px",
    },
  },
  coverLetterContainer: {
    "& div": {
      padding: "0%",
    },
  },
}));
const ContractDetails = ({
  contract,
  token,
  open,
  handleClose,
  handleClickOpen,
  handleCloseContract,
  loading,
  handleActivateContract,
  isClose,
  isActive,
}) => {
  const classes = proposalStyles();

  let details = null;
  if (contract) {
    const {
      contractTitle,
      workDetails,
      bidType,
      workDetailsFile,
      createdAt,
      freelancer,
      job,
      fixedBidAmount,
      hourlyBidAmount,
    } = contract;
    let role;
    if (token) {
      role = jwt_decode(token);
    }

    details = (
      <>
        <div className={classes.detailContainer}>
          <div>
            <Typography variant="h6">{contractTitle}</Typography>
            {bidType === "fixed" ? (
              <Typography
                variant="subtitle2"
                style={{ marginTop: "7px", color: "#303f9f" }}
              >
                <i>Fixed: ${fixedBidAmount && fixedBidAmount.amount}</i>
              </Typography>
            ) : (
              <Typography
                variant="subtitle2"
                style={{ marginTop: "7px", color: "#303f9f" }}
              >
                <i>Hourly: {hourlyBidAmount && hourlyBidAmount.amount}</i>
              </Typography>
            )}

            <Typography
              variant="body1"
              style={{ top: "12px", position: "relative", marginBottom: "5px" }}
            >
              Created <strong>{moment(createdAt).fromNow()}</strong>
            </Typography>
          </div>
          <div>
            <pre
              style={{
                whiteSpace: "pre-line",
                lineHeight: "20px",
              }}
            >
              <Typography variant="subtitle1"> {workDetails}</Typography>
            </pre>
          </div>

          <div
            style={{
              marginTop: "4px",
              borderBottom: "0px",
              display: "flex",
              justifyContent: "left",
            }}
          >
            <AttachFile fontSize="small" color="primary" />{" "}
            <a
              href={WORK_DETAILS_FILE_URL + `${workDetailsFile}`}
              style={{ color: "#303f9f" }}
              download
            >
              <Typography variant="body2">{workDetailsFile}</Typography>
            </a>
          </div>
        </div>
        <div>
          <div className={classes.clientInfo}>
            <div className={classes.buttonContainer}>
              <StripeCheckout
                disabled={isActive}
                stripeKey="pk_test_51Jecg6HD0hPW7f7NzifEzWldla7kq94WJGwrjv1najZzQ0dPDSWsTZMny91vMrgsmbYIkW7TZyuKW0biD5TXN1t800dCFkNESx"
                token={handleActivateContract}
                name={isActive ? "Contract Activated" : "Activate Contract"}
                amount={
                  bidType === "fixed"
                    ? fixedBidAmount.amount * 100
                    : hourlyBidAmount && hourlyBidAmount.amount * 100
                }
              >
                {loading ? (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isActive}
                  >
                    Loading.....
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isActive}
                  >
                    {isActive ? "Contract Activated" : "Activate Contract"}
                  </Button>
                )}
              </StripeCheckout>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleClickOpen}
                disabled={isClose}
                style={{ width: "89%" }}
              >
                {!isClose ? "Close Contract" : "Closed"}
              </Button>
            </div>
          </div>
          <div style={{ padding: "8%", borderBottom: "1px solid #white" }}>
            <Typography variant="h6">About the job</Typography>
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "left",
              }}
            >
              <Link
                to={
                  role === "freelancer"
                    ? `/find-work/jobs/details/${job && job._id}`
                    : `/employer/my-jobs/${job && job._id}/${job && job.title}`
                }
              >
                See job details
              </Link>
            </div>
          </div>

          <div style={{ padding: "8%", borderBottom: "1px solid #white" }}>
            {role === "employer" && (
              <>
                <Typography variant="h6">About the freelancer</Typography>
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "left",
                  }}
                >
                  <Link to={`/freelancer/${freelancer._id}/details`}>
                    See freelancer profile
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <Paper className={classes.proposalContainer}>
      {" "}
      {details}{" "}
      <DialogBox
        open={open}
        handleClose={handleClose}
        handleConfirm={handleCloseContract}
        loading={loading}
        confirmBtnTxt="Close the contract"
      >
        <DialogTitle id="responsive-dialog-title">
          Do you really want to close this contract?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            We will politely notify the freelancer that you are going to close
            the contract. Once this step is completed you cannot undo this
            process.
          </DialogContentText>
        </DialogContent>
      </DialogBox>
    </Paper>
  );
};

export default ContractDetails;
