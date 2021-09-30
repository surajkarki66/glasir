import Axios from "../../axios-url";
import Cookie from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, withRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Typography } from "@material-ui/core";

import ProposalDetails from "../../components/proposal/ProposalDetails";

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

const ProposalDetailsPage = ({ history }) => {
  const [proposal, setProposal] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const { id } = useParams();
  const token = Cookie.get("token");
  const classes = useStyles();
  const profile = useSelector((state) => state.checkProfileState);

  const getProposalDetails = useCallback(
    async (proposalId, token) => {
      setLoading(true);
      try {
        const res = await Axios.get(`/api/v1/proposal/${proposalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { data, status } = res.data;
        if (status === "success") {
          setProposal(data);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [setError]
  );
  const withdrawProposal = async (proposalId, freelancerId, token) => {
    try {
      const res = await Axios.delete(
        `/api/v1/proposal/withdrawProposal/${proposalId}/${freelancerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { status } = res.data;
      if (status === "success") {
        setBtnLoading(false);
        history.push("/proposals");
      }
    } catch (error) {
      setBtnLoading(false);
      setError(error.response.data.data.error);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      getProposalDetails(id, token);
    }
  }, [getProposalDetails, id, token]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleWithdraw = () => {
    setBtnLoading(true);
    withdrawProposal(id, profile.data.data._id, token);
  };
  const handleEditProposal = () => {
    history.push({ pathname: `/proposals/${id}/edit`, state: { proposal } });
  };
  return (
    <div className={classes.root}>
      <Typography variant="h5" style={{ textAlign: "center" }}>
        Proposal details
      </Typography>
      <div>
        {!loading && profile.data && proposal ? (
          <>
            {error && (
              <Typography
                variant="body1"
                style={{ textAlign: "center", marginTop: "6%" }}
              >
                {error}
              </Typography>
            )}
            <ProposalDetails
              proposal={proposal}
              open={open}
              handleClose={handleClose}
              handleClickOpen={handleClickOpen}
              handleWithdraw={handleWithdraw}
              loading={btnLoading}
              handleEditProposal={handleEditProposal}
            />
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

export default withRouter(ProposalDetailsPage);
