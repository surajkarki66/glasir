import Cookie from "js-cookie";
import Axios from "../../axios-url";
import React, { useEffect, useState, useCallback } from "react";
import { CircularProgress, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";

import usePagination from "../../components/pagination/Pagination";
import { useStyles, jobRequestStyles } from "../../components/job/styles";
import AppPagination from "../../components/pagination/AppPagination";
import SavedJob from "../../components/job/SavedJob";

const SavedJobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [jobsPerPage, setJobsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  const _DATA = usePagination(jobs, jobsPerPage);
  const { data } = useSelector((state) => state.checkProfileState);
  const classes = useStyles();
  const jobRequestClasses = jobRequestStyles();
  const token = Cookie.get("token");
  const getSavedJobs = useCallback(
    async (freelancerId) => {
      setLoading(true);

      try {
        const res = await Axios.get(
          `/api/v1/saveJob/getSavedJobs?page=${page}&jobsPerPage=${jobsPerPage}&freelancerId=${freelancerId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { jobs, totalResults, entriesPerPage } = res.data;
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
        setLoading(false);
      }
    },
    [jobsPerPage, page, token]
  );

  useEffect(() => {
    if (data) {
      const { _id } = data.data;
      getSavedJobs(_id);
    }
  }, [data, getSavedJobs]);

  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };

  return (
    <div className={classes.jobBoardContainer}>
      <div className={classes.jobRequestsContainer}>
        {!loading && jobs ? (
          <>
            {" "}
            <div className={jobRequestClasses.jobRequests}>
              {error && (
                <div style={{ textAlign: "center", marginTop: "60px" }}>
                  <Typography variant="body1">
                    <b>{error}</b>
                  </Typography>
                </div>
              )}

              {_DATA.currentData().map((job) => (
                <SavedJob job={job} key={job._id} getSavedJobs={getSavedJobs} />
              ))}
            </div>
            <div style={{ position: "relative", left: 0, right: 0, bottom: 0 }}>
              {!loading && jobs && jobs.length !== 0 && (
                <AppPagination
                  page={page}
                  handleChange={handleChange}
                  noOfPages={noOfPages}
                />
              )}
            </div>
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

export default SavedJobPage;
