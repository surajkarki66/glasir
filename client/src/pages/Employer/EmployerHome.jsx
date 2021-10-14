import Cookie from "js-cookie";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  FormControl,
  Paper,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";

import Axios from "../../axios-url";
import SearchBox from "../../components/job/job-board/SearchBox";
import usePagination from "../../components/pagination/Pagination";
import AppPagination from "../../components/pagination/AppPagination";
import FreelancerCard from "../../components/freelancer/FreelancerCard";

const useStyles = makeStyles((theme) => ({
  home: {
    borderBottom: "1px solid white",
    boxShadow: "0px 0px 0px 0px #888888",
  },
  search: {
    borderBottom: "1px solid #dfdfdf",
    padding: "2%",
    display: "flex",
    justifyContent: "space-between",
  },
  searchBox: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  freelancers: {
    display: "grid",
    margin: "1% 8% 0 8%",
    [theme.breakpoints.down("xs")]: {
      margin: "1% 1% 0 1%",
    },
  },
  loadingIcon: {
    display: "flex",
    marginLeft: "45%",
    marginTop: "13%",
  },
  pagination: { position: "relative", left: 0, right: 0, bottom: 0 },
}));

const EmployerHome = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [service, setService] = useState("");
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [englishProficiency, setEnglishProficiency] = useState("");
  const [page, setPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [freelancersPerPage, setFreelancersPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data } = useSelector((state) => state.checkProfileState);
  const token = Cookie.get("token");
  const _DATA = usePagination(freelancers, freelancersPerPage);

  const services = [
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
  const proficiencies = [
    {
      value: "Basic",
      label: "Basic",
    },
    {
      value: "Conversational",
      label: "Conversational",
    },
    {
      value: "Fluent",
      label: "Fluent",
    },
    {
      value: "Native Or Bilingual",
      label: "Native Or Bilingual",
    },
  ];

  const getFreelancers = useCallback(
    async (text, service, expertiseLevel, englishProficiency) => {
      setLoading(true);

      try {
        const res = await Axios.get(
          `/api/v1/freelancer/search?text=${text}&service=${service}&expertiseLevel=${expertiseLevel}&province&englishProficiency=${englishProficiency}&page=${page}&freelancersPerPage=${freelancersPerPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { freelancers, totalResults, entriesPerPage } = res.data;
        setFreelancers(freelancers);
        setError("");
        setNoOfPages(Math.ceil(totalResults / freelancersPerPage));
        setFreelancersPerPage(entriesPerPage);
        setLoading(false);
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          setError("No freelancer found");
          setFreelancers([]);
          setNoOfPages(0);
          setLoading(false);
          return;
        }
        setError(error.response.data.data.error);
        setLoading(false);
      }
    },
    [freelancersPerPage, page, token]
  );

  const updateSearchTerm = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    getFreelancers(newSearchTerm, service, expertiseLevel, englishProficiency);
  };
  useEffect(() => {
    getFreelancers(searchTerm, service, expertiseLevel, englishProficiency);
  }, [englishProficiency, expertiseLevel, getFreelancers, searchTerm, service]);
  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  return (
    <div className={classes.root}>
      <Paper className={classes.home}>
        <div className={classes.search}>
          <SearchBox
            refreshFunction={updateSearchTerm}
            placeholder="Search for freelancers"
          />
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
              <InputLabel shrink>Service</InputLabel>
              <Select
                value={service}
                label="Service"
                onChange={(e) => setService(e.target.value)}
                style={{ width: "180px" }}
              >
                {services.map((service) => (
                  <MenuItem key={service.value} value={service.value}>
                    {service.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div>
            <FormControl>
              <InputLabel shrink>English Proficiency</InputLabel>
              <Select
                value={englishProficiency}
                label="English Proficiency"
                onChange={(e) => setEnglishProficiency(e.target.value)}
                style={{ width: "180px" }}
              >
                {proficiencies.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <Link to="/job-post" style={{ textDecoration: "none" }}>
            {" "}
            <Button variant="contained" color="primary">
              Post Job
            </Button>
          </Link>
        </div>

        <div className={classes.freelancers}>
          {!loading && freelancers && data ? (
            <>
              {" "}
              {_DATA.currentData().map((freelancer) => (
                <FreelancerCard freelancer={freelancer} key={freelancer._id} />
              ))}
            </>
          ) : (
            <div className={classes.loadingIcon}>
              <CircularProgress size={80} />
            </div>
          )}
        </div>
      </Paper>
      <div className={classes.pagination}>
        {!loading && freelancers && freelancers.length !== 0 && (
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

export default EmployerHome;
