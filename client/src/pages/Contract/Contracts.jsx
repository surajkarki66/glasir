import jwt_decode from "jwt-decode";
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
import ContractCard from "../../components/contract/ContractCard";

const Contracts = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [contractsPerPage, setContractsPerPage] = useState(10);
  const [noOfPages, setNoOfPages] = useState(null);
  const [contracts, setContracts] = useState([]);
  const _DATA = usePagination(contracts, contractsPerPage);
  const { data } = useSelector((state) => state.checkProfileState);
  const token = Cookie.get("token");
  const { role } = jwt_decode(token);
  const getContracts = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          role === "freelancer"
            ? `/api/v1/contract/getFreelancerContracts?page=${page}&contractsPerPage=${contractsPerPage}&freelancerId=${id}&isActive=${isActive}`
            : `/api/v1/contract/getEmployerContracts?page=${page}&contractsPerPage=${contractsPerPage}&employerId=${id}&isActive=${isActive}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { contracts, entriesPerPage, totalResults } = response.data;
        setContracts(contracts);
        setError("");
        setNoOfPages(Math.ceil(totalResults / contractsPerPage));
        setContractsPerPage(entriesPerPage);
        setLoading(false);
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          setError("No contracts found");
          setContracts([]);
          setNoOfPages(0);
          setLoading(false);
          return;
        }
        setError(error.response.data.data.error);
        setContracts([]);
        setNoOfPages(0);
        setLoading(false);
      }
    },
    [contractsPerPage, isActive, page, role, token]
  );
  useEffect(() => {
    if (data) {
      const { _id } = data.data;
      getContracts(_id);
    }
  }, [data, getContracts]);

  const handleChange = (e, p) => {
    setPage(p);
    _DATA.jump(p);
  };
  const classes = useStyles();
  return (
    <div className={classes.proposalMainContainer}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" style={{ marginTop: "18px" }}>
          My Contracts
        </Typography>
        <FormControl>
          <InputLabel>Filter</InputLabel>
          <Select
            value={isActive}
            label="Status"
            onChange={(e) => setIsActive(e.target.value)}
          >
            <MenuItem value={true}>Active</MenuItem>
            <MenuItem value={false}>Not active</MenuItem>
          </Select>
        </FormControl>
      </div>
      {!loading && contracts ? (
        <>
          {" "}
          <div className={classes.proposals}>
            {error && (
              <div style={{ textAlign: "center" }}>
                <h4>{error}</h4>
              </div>
            )}
            {_DATA.currentData().map((contract) => (
              <ContractCard contract={contract} key={contract._id} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", marginLeft: "45%", marginTop: "16%" }}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
      <div style={{ position: "relative", left: 0, right: 0, bottom: 0 }}>
        {!loading && data && contracts && contracts.length !== 0 && (
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

export default Contracts;
