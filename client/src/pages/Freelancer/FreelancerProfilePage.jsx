import Cookie from "js-cookie";
import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Button,
  Typography,
  Avatar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";

import Axios from "../../axios-url";
import FreelancerProfile from "../../components/freelancer/FreelancerProfile";
import Modal from "../../components/UI/modal/Modal";
import { checkProfile } from "../../actions/checkProfile";

const useStyles = makeStyles((theme) => ({
  avatar: {
    height: `250px !important`,
    width: `250px !important`,
  },
}));

const FreelancerProfilePage = () => {
  const classes = useStyles();
  const [avatar, setAvatar] = useState("");

  const [preview, setPreview] = useState("");
  const [open, setOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [citizenship, setCitizenship] = useState("");
  const [resume, setResume] = useState("");
  const token = Cookie.get("token");
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.checkProfileState);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
    handleOpen();
  };

  const uploadAvatar = async (e, freelancerId, token) => {
    e.preventDefault();
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("avatar", avatar);
    try {
      const res = await Axios.post(
        `/api/v1/freelancer/upload-avatar/${freelancerId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { status } = res.data;

      if (status === "success") {
        setBtnLoading(false);
        setSuccess(true);
        setOpen(false);
      }

      setBtnLoading(false);
      setSuccess(false);
    } catch (error) {
      setBtnLoading(false);
      setSuccess(false);
      setOpen(false);
      setError(error.response.data.data.error);
    }
  };

  const handleCitizenshipChange = (e) => {
    setCitizenship(e.target.files[0]);
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  const uploadDocuments = async (e, freelancerId) => {
    e.preventDefault();
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("citizenship", citizenship);
    formData.append("resume", resume);
    try {
      const res = await Axios.post(
        `/api/v1/freelancer/upload-doc/${freelancerId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { status } = res.data;
      if (status === "success") {
        setBtnLoading(false);
        setSuccess(true);
      }

      setBtnLoading(false);
      setSuccess(false);
    } catch (error) {
      setBtnLoading(false);
      setSuccess(false);
      setError(error.response.data.data.error);
    }
  };
  useEffect(() => {
    if (success) {
      dispatch(checkProfile(token));
    }
  }, [dispatch, success, token]);

  return (
    <div>
      {data ? (
        <>
          <FreelancerProfile
            freelancer={data.data}
            handleAvatarChange={handleAvatarChange}
            handleResumeChange={handleResumeChange}
            handleCitizenshipChange={handleCitizenshipChange}
            handleUpload={uploadDocuments}
            btnLoading={btnLoading}
            Resume={resume}
            Citizenship={citizenship}
          />

          <Modal open={open} handleOpen={handleOpen} handleClose={handleClose}>
            <Typography
              style={{ textAlign: "center" }}
              variant="h6"
              component="h2"
            >
              Preview
            </Typography>

            <Avatar src={preview} className={classes.avatar} />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => uploadAvatar(e, data.data._id, token)}
                disabled={btnLoading}
              >
                Upload
              </Button>
            </div>
          </Modal>
        </>
      ) : (
        <div style={{ display: "flex", marginLeft: "47%", marginTop: "18%" }}>
          <CircularProgress variant="indeterminate" disableShrink size={80} />
        </div>
      )}
    </div>
  );
};

export default FreelancerProfilePage;
