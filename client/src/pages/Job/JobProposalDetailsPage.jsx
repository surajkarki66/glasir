import Axios from "../../axios-url";
import Cookie from "js-cookie";
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Typography } from "@material-ui/core";

import JobProposalDetails from "../../components/job/JobProposalDetails";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2% 5% 5% 5%",
    backgroundColor: "#f2f2f2",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "15%",
  },
}));
const JobProposalDetailsPage = () => {
  const { proposalId, jobId } = useParams();

  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const token = Cookie.get("token");

  const getJobProposalDetails = useCallback(
    async (proposalId) => {
      setLoading(true);
      try {
        const res = await Axios.get(
          `/api/v1/proposal/getJobProposalDetails/${proposalId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { data, status } = res.data;
        if (status === "success") {
          setDetails(data);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    if (proposalId && token) {
      getJobProposalDetails(proposalId);
    }
  }, [getJobProposalDetails, proposalId, token]);

  return (
    <div className={classes.root}>
      {/* <Typography variant="h5" style={{ textAlign: "center" }}>
        Details
      </Typography> */}
      <div>
        {!loading && details ? (
          <>
            {error && (
              <Typography
                variant="body1"
                style={{ textAlign: "center", marginTop: "6%" }}
              >
                {error}
              </Typography>
            )}
            <JobProposalDetails details={details} jobId={jobId} />
          </>
        ) : (
          <div className={classes.loadingIcon}>
            <CircularProgress variant="indeterminate" disableShrink size={80} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobProposalDetailsPage;
