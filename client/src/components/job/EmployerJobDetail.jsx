import Axios from "../../axios-url";
import Cookie from "js-cookie";
import {
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
  Button,
} from "@material-ui/core";
import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link, withRouter } from "react-router-dom";
import AppPagination from "../pagination/AppPagination";
import { FREELANCER_AVATAR_URL } from "../../helpers/helper";

import usePagination from "../pagination/Pagination";

export const useStyles = makeStyles((theme) => ({
  employerJobContainer: {
    padding: "2% 3% 1% 3%",
    display: "grid",
    gridTemplateColumns: "8% auto",
    backgroundColor: "#eaeaea",
    borderRadius: "4px",
    margin: "5% 0 5% 0",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "45%",
    marginTop: "12%",
  },
  upperRight: {
    display: "flex",
    justifyContent: "center",
  },

  texts: {
    display: "flex",
    justifyContent: "space-between",
  },
  avatar: {
    height: `70px !important`, // whatever height
    width: `70px !important`, // whatever height
  },
  pagination: { position: "relative", left: 0, right: 0, bottom: 0 },
}));

const ProposalDetail = ({ proposal, handleChange, jobId }) => {
  const classes = useStyles();
  const { bidType, coverLetter, fixedBidAmount, hourlyBidAmount, freelancer } =
    proposal;

  const {
    _id,
    firstName,
    lastName,
    avatar,
    location,
    title,
    totalMoneyEarned,
    user,
  } = freelancer;
  return (
    <div className={classes.employerJobContainer}>
      <div className={classes.right}>
        <Link
          to={`/freelancer/${_id}/details`}
          style={{
            textDecoration: "none",
            color: "inherit",
            "&:hover": {
              "& h5": {
                textDecoration: "underline",
              },
            },
          }}
        >
          {avatar ? (
            <Avatar
              className={classes.avatar}
              alt={firstName + " " + lastName}
              src={FREELANCER_AVATAR_URL + avatar}
              sx={{ width: 56, height: 56 }}
            />
          ) : (
            <Avatar className={classes.avatar}>{firstName.charAt(0)}</Avatar>
          )}
        </Link>
      </div>
      <div className={classes.left}>
        <div className={classes.texts}>
          <Link
            to={`/employer/my-jobs/${jobId}/proposal/${proposal._id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
              "&:hover": {
                "& h5": {
                  textDecoration: "underline",
                },
              },
            }}
          >
            <Typography variant="h6">{firstName + " " + lastName}</Typography>
          </Link>
          <div>
            {" "}
            <Button
              variant="contained"
              size="small"
              style={{ marginRight: "20px" }}
              href={`mailto:${user.email}`}
            >
              Message
            </Button>
          </div>
        </div>
        <div>
          {" "}
          <Typography variant="body1">
            <b>{title}</b>
          </Typography>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {bidType === "hourly" ? (
            <Typography variant="body1">
              <b>${hourlyBidAmount.amount}</b> / hr
            </Typography>
          ) : (
            <Typography variant="body1">
              <b>${fixedBidAmount.amount}</b> fixed
            </Typography>
          )}
          <Typography variant="body1">
            <b>${totalMoneyEarned.amount}</b> earned
          </Typography>

          <Typography variant="body1">
            <b>
              {location.city}, {location.country}
            </b>
          </Typography>
        </div>
        <div className={classes.coverLetter}>
          <Typography variant="body1">
            <b>Cover letter - </b> {coverLetter.slice(0, 200)}
          </Typography>
        </div>
      </div>
    </div>
  );
};

const EmployerJobDetail = ({ id, history }) => {
  const classes = useStyles();
  const [status, setStatus] = useState("initial");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [proposalsPerPage, setJProposalsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState([]);
  const _DATA = usePagination(proposals, proposalsPerPage);
  const token = Cookie.get("token");
  const getProposals = useCallback(
    async (jobId, token) => {
      setLoading(true);
      try {
        const res = await Axios.get(
          `/api/v1/proposal/getJobProposals?page=${page}&proposalsPerPage=${proposalsPerPage}&jobId=${jobId}&proposalStatus=${status}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { proposals, totalResults, entriesPerPage } = res.data;
        setProposals(proposals);
        setError("");
        setNoOfPages(Math.ceil(totalResults / proposalsPerPage));
        setJProposalsPerPage(entriesPerPage);
        setLoading(false);
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          setError("No proposal found");
          setProposals([]);
          setNoOfPages(0);
          setLoading(false);
          return;
        }
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [page, proposalsPerPage, status]
  );

  useEffect(() => {
    if (id && token) {
      getProposals(id, token);
    }
  }, [getProposals, id, token]);

  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1%",
        }}
      >
        <div>
          <Button variant="contained" disabled={loading}>
            Edit Job
          </Button>
        </div>
        <div>
          <Typography variant="h6" style={{ marginTop: "18px" }}>
            Proposals for this job
          </Typography>
        </div>
        <div>
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="initial">Initial</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <>
        {!loading && _DATA ? (
          <div>
            {proposals.length === 0 && (
              <Typography
                variant="h6"
                style={{ textAlign: "center", marginTop: "12%" }}
              >
                No one applied
              </Typography>
            )}
            {_DATA.currentData().map((proposal) => (
              <ProposalDetail
                jobId={id}
                proposal={proposal}
                handleChange={handleChange}
                key={proposal._id}
              />
            ))}
            <div className={classes.pagination}>
              {proposals.length !== 0 && (
                <AppPagination
                  page={page}
                  handleChange={handleChange}
                  noOfPages={noOfPages}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={classes.loadingIcon}>
            <CircularProgress variant="indeterminate" disableShrink size={80} />
          </div>
        )}
      </>
    </div>
  );
};

export default withRouter(EmployerJobDetail);
