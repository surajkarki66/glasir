import Axios from "../../axios-url";
import Cookie from "js-cookie";
import { useSelector, useDispatch } from "react-redux";
import React, { useState, useCallback, useEffect } from "react";
import { Container, Paper, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress } from "@material-ui/core";
import { useParams } from "react-router-dom";

import { checkProfile } from "../../actions/checkProfile";
import SubmitForm from "../../components/proposal/SubmitForm";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
  },
  loadingIcon: {
    display: "flex",
    marginTop: "16%",
  },
}));

const CreateProposalPage = () => {
  const classes = useStyles();
  const { id } = useParams();
  const [job, setJob] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.checkProfileState);
  const [setError] = useState("");
  const token = Cookie.get("token");
  const getJobDetails = useCallback(
    async (jobId) => {
      try {
        setLoading(true);
        const res = await Axios.get(`/api/v1/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data } = res.data;
        setLoading(false);
        setJob(data);
      } catch (error) {
        setLoading(false);
        setError(error.response.data.data.error);
      }
    },
    [setError, token]
  );

  useEffect(() => {
    if (!profile.data) {
      dispatch(checkProfile(token));
    }

    getJobDetails(id);
  }, [dispatch, getJobDetails, id, profile.data, token]);

  return (
    <Container className={classes.container} component={Box}>
      {!loading && profile.data ? (
        <Paper
          component={Box}
          p={4}
          style={{ boxShadow: "2px 2px 3px 2px #888888" }}
        >
          <h3 style={{ textAlign: "center" }}>Submit Proposal</h3>
          <SubmitForm
            job={job}
            freelancerId={profile.data ? profile.data.data._id : null}
            token={token}
          />{" "}
        </Paper>
      ) : (
        <div className={classes.loadingIcon}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
    </Container>
  );
};

export default CreateProposalPage;
