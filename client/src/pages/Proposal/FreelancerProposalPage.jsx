import Cookie from "js-cookie";
import Axios from "../../axios-url";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from "@material-ui/core";

import AppPagination from "../../components/pagination/AppPagination";
import usePagination from "../../components/pagination/Pagination";
import { useStyles } from "../../components/proposal/styles";
import FreelancerProposal from "../../components/proposal/FreelancerProposal";

const FreelancerProposalPage = () => {
  const [status, setStatus] = useState("initial");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [proposalsPerPage, setProposalsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  const [proposals, setProposals] = useState([]);
  const _DATA = usePagination(proposals, proposalsPerPage);
  const { data } = useSelector((state) => state.checkProfileState);
  const token = Cookie.get("token");
  const getFreelancerProposals = useCallback(
    async (freelancerId) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          `/api/v1/proposal/getFreelancerProposals?page=${page}&proposalsPerPage=${proposalsPerPage}&freelancerId=${freelancerId}&status=${status}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { proposals, entriesPerPage, totalResults } = response.data;
        setProposals(proposals);
        setError("");
        setNoOfPages(Math.ceil(totalResults / proposalsPerPage));
        setProposalsPerPage(entriesPerPage);
        setLoading(false);
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          setError("No proposals found");
          setProposals([]);
          setNoOfPages(0);
          setLoading(false);
          return;
        }
        setError(error.response.data.data.error);
        setProposals([]);
        setNoOfPages(0);
        setLoading(false);
      }
    },
    [page, proposalsPerPage, status, token]
  );
  useEffect(() => {
    if (data) {
      const { _id } = data.data;
      getFreelancerProposals(_id);
    }
  }, [data, getFreelancerProposals]);
  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  const classes = useStyles();
  return (
    <div className={classes.proposalMainContainer}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" style={{ marginTop: "18px" }}>
          My Proposals
        </Typography>
        <FormControl>
          <InputLabel>Filter by status</InputLabel>
          <Select
            style={{ width: "110px" }}
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
      {!loading && proposals ? (
        <>
          {" "}
          <div className={classes.proposals}>
            {error && (
              <div style={{ textAlign: "center" }}>
                <h4>{error}</h4>
              </div>
            )}
            {proposals.map((proposal) => (
              <FreelancerProposal proposal={proposal} key={proposal._id} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", marginLeft: "45%", marginTop: "16%" }}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
      <div style={{ position: "relative", left: 0, right: 0, bottom: 0 }}>
        {!loading && data && proposals && proposals.length !== 0 && (
          <AppPagination
            page={page}
            handleChange={handleChange}
            noOfPages={noOfPages}
          />
        )}
      </div>
    </div>
  );
};

export default FreelancerProposalPage;
