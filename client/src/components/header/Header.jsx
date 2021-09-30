import jwt_decode from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import Cookie from "js-cookie";

import {
  AppBar,
  Avatar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  MenuItem,
  Menu,
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import { signOut } from "../../helpers/auth";
import { checkProfile } from "../../actions/checkProfile";
import {
  EMPLOYER_AVATAR_URL,
  FREELANCER_AVATAR_URL,
} from "../../helpers/helper";

import { useStyles } from "./styles";

const Header = (props) => {
  const classes = useStyles();
  const profile = useSelector((state) => state.checkProfileState);
  const dispatch = useDispatch();
  const token = Cookie.get("token");

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!profile.data && token) {
      dispatch(checkProfile(token));
    }
  }, [dispatch, profile.data, token]);
  let links = (
    <div className={classes.buttonContainer}>
      <Link to="/sign-in">
        <Button color="inherit">Sign In</Button>
      </Link>
      <Link to="/sign-up">
        <Button color="inherit">Sign Up</Button>
      </Link>
    </div>
  );
  let homeLink = (
    <Link to="/" className={classes.homeLink}>
      <Typography variant="h6" className={classes.title}>
        Glasir
      </Typography>
    </Link>
  );

  if (token) {
    if (profile.data) {
      const { hasProfile, data } = profile.data;

      if (hasProfile) {
        const { role } = jwt_decode(token);
        if (role === "freelancer") {
          links = (
            <div className={classes.buttonContainer}>
              {" "}
              <Link to="/find-work/jobs/saved" style={{ marginRight: "20px" }}>
                <Button color="inherit">Saved Jobs</Button>
              </Link>
              <Link to="/proposals" style={{ marginRight: "20px" }}>
                <Button color="inherit">Proposals</Button>
              </Link>
              <Link to="/contracts" style={{ marginRight: "20px" }}>
                <Button color="inherit">Contracts</Button>
              </Link>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
                sx={{ ml: 2 }}
              >
                {data ? (
                  <Avatar
                    src={FREELANCER_AVATAR_URL + data.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle size="large" fontSize="large" />
                )}
              </IconButton>
            </div>
          );
          homeLink = (
            <Link to="/find-work/recommended" className={classes.homeLink}>
              <Typography variant="h6" className={classes.title}>
                Glasir
              </Typography>
            </Link>
          );
        } else if (role === "employer") {
          links = (
            <div className={classes.buttonContainer}>
              <Link to="/employer/my-jobs" style={{ marginRight: "20px" }}>
                <Button color="inherit">My Jobs</Button>
              </Link>
              <Link to="/contracts" style={{ marginRight: "20px" }}>
                <Button color="inherit">Contracts</Button>
              </Link>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
              >
                {data && data.avatar ? (
                  <Avatar
                    src={EMPLOYER_AVATAR_URL + data.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle size="large" fontSize="large" />
                )}
              </IconButton>
            </div>
          );
          homeLink = (
            <Link to="/employer/home" className={classes.homeLink}>
              <Typography variant="h6" className={classes.title}>
                Glasir
              </Typography>
            </Link>
          );
        } else {
          links = (
            <div className={classes.buttonContainer}>
              <Link to="/admin">
                <Button color="inherit">Admin</Button>
              </Link>

              <Button
                color="inherit"
                onClick={() => {
                  signOut(() => {
                    props.history.push("/");
                  });
                }}
              >
                Logout
              </Button>
            </div>
          );
          homeLink = (
            <Link to="/admin" className={classes.homeLink}>
              <Typography variant="h6" className={classes.title}>
                Glasir
              </Typography>
            </Link>
          );
        }
      }
    } else {
      links = null;
    }
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {homeLink}
          <div>{links}</div>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                const { role } = jwt_decode(token);
                if (role === "employer") {
                  props.history.push("/employer/profile");
                }
                if (role === "freelancer") {
                  props.history.push("/freelancer/profile");
                }
              }}
            >
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                const { role } = jwt_decode(token);
                if (role === "employer") {
                  props.history.push("/employer/account");
                }
                if (role === "freelancer") {
                  props.history.push("/freelancer/account");
                }
              }}
            >
              My account
            </MenuItem>
            <MenuItem
              onClick={() => {
                signOut(() => {
                  setAnchorEl(null);
                  props.history.push("/");
                });
              }}
            >
              Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default withRouter(Header);
