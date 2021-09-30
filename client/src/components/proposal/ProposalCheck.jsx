import { Button } from "@material-ui/core";
import { LinearProgress } from "@material-ui/core";
import Cookie from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
import Axios from "../../axios-url";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router";

import { checkProfile } from "../../actions/checkProfile";

const ProposalCheck = ({ jobId, history }) => {
  const profile = useSelector((state) => state.checkProfileState);
  const dispatch = useDispatch();
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = Cookie.get("token");
  const checkProposal = useCallback(
    async (_id) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          `/api/v1/proposal/isProposalExist/${jobId}/${_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status === "success") {
          if (response.data.data.isProposalExist) {
            setIsApplied(true);
            setLoading(false);
          } else {
            setIsApplied(false);
            setLoading(false);
          }
        }
      } catch (e) {
        setLoading(false);
      }
    },
    [jobId, token]
  );
  useEffect(() => {
    if (!profile.data) {
      dispatch(checkProfile(token));
    }
    if (profile.data) {
      const { _id } = profile.data.data;
      checkProposal(_id);
    }
  }, [checkProposal, dispatch, profile.data, token]);
  const buttonClickHandler = () => {
    history.push(`/find-work/jobs/details/${jobId}/apply`);
  };
  return (
    <React.Fragment>
      <>
        {!loading && profile.data ? (
          <Button
            variant="contained"
            color="primary"
            disabled={isApplied ? true : false}
            onClick={buttonClickHandler}
          >
            {isApplied ? "Proposal Submitted" : "Submit Proposal"}
          </Button>
        ) : (
          <LinearProgress />
        )}
      </>
    </React.Fragment>
  );
};

export default withRouter(ProposalCheck);
