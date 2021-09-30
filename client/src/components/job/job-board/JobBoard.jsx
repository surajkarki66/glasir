// TODO: Add filtering of jobs

import Cookie from "js-cookie";
import Axios from "../../../axios-url";
import React, { useEffect, useState, useCallback } from "react";
import {
  LinearProgress,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";

import { useSelector } from "react-redux";
import SearchBox from "./SearchBox";
import JobRequest from "./JobRequest";
import { useStyles } from "../styles";
import AppPagination from "../../pagination/AppPagination";
import usePagination from "../../pagination/Pagination";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [projectType, setProjectType] = useState("");
  const [payType, setPayType] = useState("");
  const [jobsPerPage, setJobsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = useSelector((state) => state.checkProfileState);
  const classes = useStyles();
  const token = Cookie.get("token");
  const _DATA = usePagination(jobs, jobsPerPage);

  // TODO: Fixed category search
  const categories = [
    {
      value: "Administration",
      label: "Administration",
    },
    {
      value: "Design And Creative",
      label: "Design And Creative",
    },
    {
      value: "Engineering And Architecture",
      label: "Engineering And Architecture",
    },
    {
      value: "Marketing",
      label: "Marketing",
    },
    {
      value: "Web,Mobile And Software Dev",
      label: "Web,Mobile And Software Dev",
    },
    {
      value: "Writing",
      label: "Writing",
    },
  ];
  const expertiseLevels = [
    {
      value: "Beginner",
      label: "Beginner",
    },
    {
      value: "Intermediate",
      label: "Intermediate",
    },
    {
      value: "Expert",
      label: "Expert",
    },
  ];
  const projectTypes = [
    {
      value: "onetime",
      label: "One-time project",
    },
    {
      value: "ongoing",
      label: "Ongoing project",
    },
  ];
  const payTypes = [
    { value: "hourly", label: "Pay by the hour" },
    { value: "fixed", label: "Pay a fixed price" },
  ];

  const getJobs = useCallback(
    async (text, category, expertiseLevel, projectType, payType) => {
      setLoading(true);
      if (category) {
        try {
          const res = await Axios.get(
            `/api/v1/job/search?text=${text}&page=${page}&jobsPerPage=${jobsPerPage}&category=${category}&expertiseLevel=${expertiseLevel}&projectType=${projectType}&payType=${payType}`,
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
      }
    },
    [jobsPerPage, page, token]
  );

  const updateSearchTerm = (
    newSearchTerm,
    category,
    expertiseLevel,
    projectType,
    payType
  ) => {
    setSearchTerm(newSearchTerm);
    getJobs(newSearchTerm, category, expertiseLevel, projectType, payType);
  };
  useEffect(() => {
    if (localStorage.getItem("service")) {
      setCategory(localStorage.getItem("service"));
    }
    if (data) {
      if (data.data) {
        getJobs(searchTerm, category, expertiseLevel, projectType, payType);
      }
    }
  }, [
    category,
    data,
    expertiseLevel,
    getJobs,
    payType,
    projectType,
    searchTerm,
  ]);
  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  return (
    <div className={classes.jobBoardContainer}>
      <div className={classes.jobRequestsContainer}>
        <SearchBox
          refreshFunction={updateSearchTerm}
          placeholder="Search Jobs"
        />

        {!loading && jobs && data ? (
          <>
            {" "}
            <div className={classes.jobRequests}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ marginTop: "18px" }}>
                  {" "}
                  <Typography variant="h6">Most Recent For You</Typography>
                </div>
                <div>
                  {" "}
                  <FormControl>
                    <InputLabel shrink>Category</InputLabel>
                    <Select
                      value={category}
                      label="Category"
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: "180px" }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl>
                    <InputLabel shrink>Expertise level</InputLabel>
                    <Select
                      value={expertiseLevel}
                      label="Expertise Level"
                      onChange={(e) => setExpertiseLevel(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      {expertiseLevels.map((e) => (
                        <MenuItem key={e.value} value={e.value}>
                          {e.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl>
                    <InputLabel shrink>Project type</InputLabel>
                    <Select
                      value={projectType}
                      label="Project Type"
                      onChange={(e) => setProjectType(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      {projectTypes.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          {p.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div>
                  <FormControl>
                    <InputLabel shrink>Pay type</InputLabel>
                    <Select
                      value={payType}
                      label="Pay Type"
                      onChange={(e) => setPayType(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      {payTypes.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          {p.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>{" "}
              {error && (
                <div style={{ textAlign: "center", marginTop: "15%" }}>
                  <h4>{error}</h4>
                </div>
              )}
              {_DATA.currentData().map((job) => (
                <JobRequest job={job} key={job._id} />
              ))}
            </div>
            <div className={classes.pagination}>
              {jobs.length !== 0 && (
                <AppPagination
                  page={page}
                  handleChange={handleChange}
                  noOfPages={noOfPages}
                />
              )}
            </div>
          </>
        ) : (
          <LinearProgress />
        )}
      </div>
    </div>
  );
};

export default JobBoard;
