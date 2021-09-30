import { Button } from "@material-ui/core";
import { LinearProgress } from "@material-ui/core";
import Cookie from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
import Axios from "../../axios-url";
import { withRouter } from "react-router";

const HireCheck = ({
  jobId,
  history,
  freelancerId,
  proposalId,
  bidType,
  fixedBidAmount,
  hourlyBidAmount,
}) => {
  const [isHired, setIsHired] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = Cookie.get("token");
  const checkHire = useCallback(
    async (jobId, freelancerId) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          `/api/v1/job/isFreelancerHired/${jobId}/${freelancerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status === "success") {
          if (response.data.data.isHired) {
            setIsHired(true);
            setLoading(false);
          } else {
            setIsHired(false);
            setLoading(false);
          }
        }
      } catch (e) {
        setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    if (jobId && freelancerId) {
      checkHire(jobId, freelancerId);
    }
  }, [checkHire, freelancerId, jobId, token]);
  const buttonClickHandler = () => {
    history.push({
      pathname: `/employer/my-jobs/${jobId}/hire/freelancer/${freelancerId}`,
      state: { bidType, fixedBidAmount, hourlyBidAmount, proposalId },
    });
  };
  return (
    <React.Fragment>
      <>
        {!loading ? (
          <Button
            variant="contained"
            color="primary"
            disabled={isHired ? true : false}
            onClick={buttonClickHandler}
          >
            {isHired ? "Hired" : "Hire"}
          </Button>
        ) : (
          <LinearProgress />
        )}
      </>
    </React.Fragment>
  );
};

export default withRouter(HireCheck);
