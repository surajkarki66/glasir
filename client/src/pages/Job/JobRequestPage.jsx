import Cookie from "js-cookie";
import moment from "moment";
import Axios from "../../axios-url";
import { CircularProgress } from "@material-ui/core";
import { VerifiedUser, LocationOn } from "@material-ui/icons";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Paper, Typography } from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";

import SaveJobBtn from "../../components/job/SaveJobBtn";
import ProposalCheck from "../../components/proposal/ProposalCheck";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2% 12% 5% 12%",
    backgroundColor: "#f2f2f2",
  },
  jobRequestContainer: {
    marginTop: "5px",
    display: "grid",
    gridTemplateColumns: "70% auto",
  },
  detailContainer: {
    borderRight: "1px solid #cec7c6",
    "& div": {
      padding: "3%",
      borderBottom: "1px solid #cec7c6",
    },
  },
  buttonContainer: {
    padding: "8%",
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid #cec7c6",
    "& button": {
      marginBottom: "20px",
    },
  },
  tagsContainer: {
    display: "flex",
    "& p": {
      marginRight: "8px",
      backgroundColor: "#a2a2a2",
      padding: "8px 7px 4px 7px",
      borderRadius: "4px",
    },
  },
  clientInfo: {
    padding: "8%",
    borderBottom: "1px solid #cec7c6",
  },
  activity: {
    padding: "8%",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "18%",
  },
}));

const JobRequest = () => {
  const classes = useStyles();
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const { id } = useParams();
  const token = Cookie.get("token");

  const getJobDetails = useCallback(
    async (jobId) => {
      setLoading(true);
      try {
        const res = await Axios.get(`/api/v1/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data, status } = res.data;
        if (status === "success") {
          setJob(data);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [setError, token]
  );

  useEffect(() => {
    if (id) {
      getJobDetails(id);
    }
  }, [getJobDetails, id]);
  let jobComp = null;
  if (job) {
    const {
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
    } = job;
    if (expertise) {
      const { skills, expertiseLevel } = expertise;
      const { location, rating, payment, totalMoneySpent } = employer;
      jobComp = (
        <Paper className={classes.jobRequestContainer}>
          <div className={classes.detailContainer}>
            <div>
              <Typography variant="h5">{title}</Typography>
              <Typography
                variant="subtitle2"
                style={{ marginTop: "7px", color: "#303f9f" }}
              >
                <i>{category}</i>
              </Typography>
              <Typography
                variant="body1"
                style={{ top: "12px", position: "relative" }}
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
                <Typography variant="subtitle1">{description}</Typography>
              </pre>
            </div>
            <div className={classes.tagsContainer}>
              {skills.map((skill) => (
                <Typography variant="body2" key={skill}>
                  {skill}
                </Typography>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              <Typography variant="subtitle1">
                Expertise Level: <b>{expertiseLevel}</b>
              </Typography>
              <Typography variant="subtitle1" style={{ marginLeft: "10%" }}>
                Project Type:{" "}
                <b>
                  {projectType === "ongoing"
                    ? "On-going project"
                    : "One-time project"}
                </b>
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              {pay.type === "fixed" ? (
                <>
                  <Typography variant="subtitle1">
                    Est. Budget: <strong>${pay.price.amount}</strong>
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    style={{ marginLeft: "20.5%" }}
                  >
                    Pay Type: <b>Fixed</b>
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
                </>
              )}
            </div>
          </div>
          <div>
            <div className={classes.buttonContainer}>
              <ProposalCheck jobId={id} />
              <SaveJobBtn jobId={id} btn={true} />
            </div>
            <div className={classes.clientInfo}>
              <Typography variant="h6">About the client</Typography>
              <div style={{ marginTop: "15px" }}>
                {payment.isVerified && <VerifiedUser />}{" "}
                <span style={{ bottom: "6px", position: "relative" }}>
                  {payment.isVerified
                    ? "Payment is verified"
                    : "Payment method not verified"}
                </span>
              </div>
              <div style={{ marginTop: "13px" }}>
                <LocationOn />{" "}
                <span style={{ bottom: "6px", position: "relative" }}>
                  {" "}
                  {location.country}
                </span>
              </div>
              <div style={{ marginTop: "13px" }}>
                {" "}
                <Rating
                  name="disabled"
                  value={rating.averageScore}
                  precision={0.5}
                  disabled
                />
                <span style={{ bottom: "5px", position: "relative" }}>
                  {" "}
                  ({rating.rateCounts}{" "}
                  {rating.rateCounts <= 1 ? "review" : "reviews"})
                </span>
              </div>
              <div style={{ marginTop: "13px" }}>
                <i>${totalMoneySpent.amount / 1000}k+ spent</i>
              </div>
            </div>
            <div className={classes.activity}>
              <Typography variant="h6">Activity on job</Typography>
              <div style={{ marginTop: "15px" }}>
                Number of proposals: <b>{proposals.length}</b>
              </div>
              <div style={{ marginTop: "13px" }}>
                Number of hired people: <b>{hired.length}</b>
              </div>
            </div>
          </div>
        </Paper>
      );
    }
  }
  return (
    <div className={classes.root}>
      {!loading && job ? (
        <div> {jobComp}</div>
      ) : (
        <div className={classes.loadingIcon}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
    </div>
  );
};

export default JobRequest;
