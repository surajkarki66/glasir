import Cookie from "js-cookie";
import { makeStyles } from "@material-ui/core/styles";
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
import EmployerJob from "../../components/job/EmployerJob";

export const useStyles = makeStyles((theme) => ({
  jobMainContainer: {
    display: "grid",
    margin: "1% 8% 0 8%",
    [theme.breakpoints.down("xs")]: {
      margin: "1% 1% 0 1%",
    },
  },
  jobs: {
    marginTop: "2%",
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "47%",
    marginTop: "17%",
  },
  pagination: { position: "absolute", left: 0, right: 0, bottom: 0 },
}));

const EmployerJobsPage = () => {
  const [status, setStatus] = useState("opened");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(10);
  const [jobs, setJobs] = useState([]);
  const _DATA = usePagination(jobs, jobsPerPage);
  const { data } = useSelector((state) => state.checkProfileState);
  const token = Cookie.get("token");
  const getEmployerJobs = useCallback(
    async (employerId) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          `api/v1/job/getEmployerJobs?page=${page}&jobsPerPage=${jobsPerPage}&employerId=${employerId}&jobStatus=${status}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { jobs, entriesPerPage, totalResults } = response.data;
        setJobs(jobs);
        setError("");
        setNoOfPages(Math.ceil(totalResults / jobsPerPage));
        setJobsPerPage(entriesPerPage);
        setLoading(false);
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          setError("No jobs found");
          setJobs([]);
          setNoOfPages(0);
          setLoading(false);
          return;
        }
        setError(error.response.data.data.error);
        setJobs([]);
        setNoOfPages(0);
        setLoading(false);
      }
    },
    [jobsPerPage, page, status, token]
  );
  useEffect(() => {
    if (data) {
      const { _id } = data.data;
      getEmployerJobs(_id);
    }
  }, [data, getEmployerJobs]);
  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  const classes = useStyles();
  return (
    <div className={classes.jobMainContainer}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" style={{ marginTop: "18px" }}>
          My Postings
        </Typography>
        <FormControl>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="opened">Opened</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </div>
      {!loading && jobs ? (
        <>
          {" "}
          <div className={classes.jobs}>
            {error && (
              <div style={{ textAlign: "center" }}>
                <h4>{error}</h4>
              </div>
            )}
            {jobs.map((job) => (
              <EmployerJob job={job} key={job._id} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", marginLeft: "45%", marginTop: "16%" }}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
      <div style={{ position: "relative", left: 0, right: 0, bottom: 0 }}>
        {!loading && data && jobs && jobs.length !== 0 && (
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

export default EmployerJobsPage;
