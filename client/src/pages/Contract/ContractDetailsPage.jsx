import Axios from "../../axios-url";
import Cookie from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, Typography } from "@material-ui/core";

import ContractDetails from "../../components/contract/ContractDetails";

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

const ContractDetailsPage = ({ history }) => {
  const { id } = useParams();
  const [contract, setContract] = useState({});
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [isClose, setIsClose] = useState(false);
  const [isActive, setIsActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const Token = Cookie.get("token");
  const classes = useStyles();

  const getContractDetails = useCallback(
    async (contractId, token) => {
      setLoading(true);
      try {
        const res = await Axios.get(
          `/api/v1/contract/getContractDetails/${contractId}`,
          {
            headers: { Authorization: `Bearer ${Token}` },
          }
        );
        const { data, status } = res.data;
        if (status === "success") {
          setContract(data);
          setIsClose(data.isClosed);
          setIsActive(data.isActive);
          setLoading(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [Token]
  );
  const closeContract = async (
    contractId,
    jobId,
    employerId,
    freelancerId,
    Token
  ) => {
    try {
      const res = await Axios.post(
        `/api/v1/contract/closeContract`,
        { contractId, jobId, freelancerId, employerId },
        {
          headers: { Authorization: `Bearer ${Token}` },
        }
      );
      const { status } = res.data;
      if (status === "success") {
        setIsClose(!isClose);
        setBtnLoading(false);
        setOpen(false);
      }
    } catch (error) {
      setBtnLoading(false);
      setError(error.response.data.data.error);
      setOpen(false);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseContract = () => {
    setBtnLoading(true);
    closeContract(
      id,
      contract.job._id,
      contract.employerId,
      contract.freelancer._id,
      Token
    );
    history.push(`/contracts/${id}/details`);
  };
  const activateContract = (
    token,
    contractId,
    freelancerId,
    employerId,
    bidType,
    fixedBidAmount,
    hourlyBidAmount
  ) => {
    let body = { token, contractId, freelancerId, employerId };
    if (bidType === "fixed") {
      body = { ...body, fixedBidAmount };
    } else {
      body = { ...body, hourlyBidAmount };
    }
    Axios.post("/api/v1/contract/activateContract", body, {
      headers: { Authorization: `Bearer ${Token}` },
    })
      .then((res) => {
        const { status } = res.data;
        if (status === "success") {
          setIsActive(!isActive);
          setBtnLoading(false);
        }
      })
      .catch((err) => {
        setBtnLoading(false);
        setError(err.response.data.data.error);
      });
  };
  const handleActivateContract = (token) => {
    setBtnLoading(true);
    activateContract(
      token,
      id,
      contract.freelancer._id,
      contract.employerId,
      contract.bidType,
      contract.fixedBidAmount,
      contract.hourlyBidAmount
    );
    history.push(`/contracts/${id}/details`);
  };
  useEffect(() => {
    if (id && Token) {
      getContractDetails(id, Token);
    }
  }, [getContractDetails, id, Token]);

  return (
    <div className={classes.root}>
      <Typography variant="h5" style={{ textAlign: "center" }}>
        Contract details
      </Typography>
      <div>
        {!loading && contract ? (
          <>
            {error && (
              <Typography
                variant="body1"
                style={{ textAlign: "center", marginTop: "6%" }}
              >
                {error}
              </Typography>
            )}
            <ContractDetails
              contract={contract}
              open={open}
              handleClose={handleClose}
              handleClickOpen={handleClickOpen}
              handleCloseContract={handleCloseContract}
              handleActivateContract={handleActivateContract}
              loading={btnLoading}
              isClose={isClose}
              isActive={isActive}
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

export default withRouter(ContractDetailsPage);
