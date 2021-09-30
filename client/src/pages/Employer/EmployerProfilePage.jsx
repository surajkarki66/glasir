import Cookie from "js-cookie";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CircularProgress,
  Avatar,
  Button,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Axios from "../../axios-url";
import Modal from "../../components/UI/modal/Modal";
import { checkProfile } from "../../actions/checkProfile";
import EmployerProfile from "../../components/employer/EmployerProfile";

const useStyles = makeStyles((theme) => ({
  avatar: {
    height: `250px !important`,
    width: `250px !important`,
  },
}));
const EmployerProfilePage = () => {
  const classes = useStyles();
  const [avatar, setAvatar] = useState("");

  const [preview, setPreview] = useState("");
  const [open, setOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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

  const uploadAvatar = async (e, employerId, token) => {
    e.preventDefault();
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("avatar", avatar);
    try {
      const res = await Axios.post(
        `/api/v1/employer/upload-avatar/${employerId}`,
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
  useEffect(() => {
    if (success) {
      dispatch(checkProfile(token));
    }
  }, [dispatch, success, token]);
  return (
    <div>
      {data ? (
        <>
          <EmployerProfile
            employer={data.data}
            handleAvatarChange={handleAvatarChange}
            btnLoading={btnLoading}
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

export default EmployerProfilePage;
