import { Button } from "@material-ui/core";
import { LinearProgress } from "@material-ui/core";
import { Bookmark } from "@material-ui/icons";
import Cookie from "js-cookie";
import React, { useEffect, useState, useCallback } from "react";
import Axios from "../../axios-url";
import { useSelector, useDispatch } from "react-redux";
import { withRouter } from "react-router";

import { checkProfile } from "../../actions/checkProfile";

const SaveJobBtn = ({ jobId, btn = false, getSavedJobs }) => {
  const profile = useSelector((state) => state.checkProfileState);
  const dispatch = useDispatch();
  const [isSave, setIsSave] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = Cookie.get("token");
  const checkSave = useCallback(
    async (_id) => {
      setLoading(true);
      try {
        const response = await Axios.get(
          `/api/v1/saveJob/isJobSaved/${jobId}/${_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status === "success") {
          if (response.data.data.isSaved) {
            setIsSave(true);
            setLoading(false);
          } else {
            setIsSave(false);
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
      checkSave(_id);
    }
  }, [checkSave, dispatch, profile.data, token]);

  const onSave = () => {
    if (profile.data && !isSave) {
      const { _id } = profile.data.data;
      setLoading(true);
      Axios.post(
        `/api/v1/saveJob/saveJob`,
        {
          freelancerId: _id,
          jobId: jobId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ).then((response) => {
        if (response.data.status === "success") {
          setIsSave(true);
          setLoading(false);
        } else {
          alert("Failed to save job");
          setLoading(false);
        }
      });
    } else {
      if (profile.data) {
        const { _id } = profile.data.data;
        setLoading(true);
        Axios.post(
          `/api/v1/saveJob/unsavedJob`,
          {
            freelancerId: _id,
            jobId: jobId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((response) => {
          if (response.data.status === "success") {
            setSuccess(true);
            setLoading(false);
          } else {
            alert("Failed to unsaved the job");
            setLoading(false);
          }
        });
      }
    }
  };
  if (success) {
    const { _id } = profile.data.data;
    getSavedJobs(_id);
  }
  return (
    <React.Fragment>
      {btn ? (
        <>
          {!loading && profile.data ? (
            <Button variant="contained" onClick={onSave}>
              {isSave ? "Remove Job Request" : "Save Job Request"}
            </Button>
          ) : (
            <div style={{ bottom: "3.4px", position: "relative" }}>
              {" "}
              <LinearProgress />
            </div>
          )}
        </>
      ) : (
        <Button onClick={onSave}>
          <Bookmark fontSize="large" />
        </Button>
      )}
    </React.Fragment>
  );
};

export default withRouter(SaveJobBtn);
