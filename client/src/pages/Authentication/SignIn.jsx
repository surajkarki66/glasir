import React from "react";
import Cookie from "js-cookie";
import jwt_decode from "jwt-decode";
import PropTypes from "prop-types";
import { Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";

import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Typography } from "@material-ui/core";

import { useSpring, animated } from "react-spring";

import { signIn } from "../../actions/signIn";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    minHeight: "80vh",
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "35ch",
    },
    "& p": {
      marginTop: "15px",
    },
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
    margin: "20px 0 20px 0",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const SignIn = ({ signIn, signInState }) => {
  const classes = useStyles();

  const [email, changeEmail] = React.useState("");
  const [password, changePassword] = React.useState("");
  const [emailError, changeEmailError] = React.useState("");
  const [passwordError, changePasswordError] = React.useState("");

  const history = useHistory();

  if (signInState.signInSuccessfulRedirect) {
    const token = Cookie.get("token");
    if (token) {
      const { role } = jwt_decode(token);
      if (role === "employer") {
        history.push("/employer/home");
      } else if (role === "freelancer") {
        history.push("/find-work/recommended");
      } else if (role === "admin") {
        history.push("/admin");
      }
    }
  }
  const checkForm = () => {
    let re = /\S+@\S+\.\S+/;
    let validEmail = re.test(email);
    if (email === "") {
      changeEmailError("Enter email");
      return false;
    } else if (!validEmail) {
      changeEmailError("Enter a valid email");
      return false;
    } else if (password.length < 8) {
      changePasswordError("Password should be 8 characters or more");
      return false;
    }
    return true;
  };

  const renderButton = () => {
    if (!signInState.signingIn) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            let formComplete = false;
            formComplete = checkForm();
            if (!formComplete) {
              return null;
            }
            signIn(email, password);
          }}
        >
          Sign In
        </Button>
      );
    } else {
      return (
        <Button variant="contained" color="primary" disabled>
          Signing in ...
        </Button>
      );
    }
  };

  const showError = () => {
    if (signInState.signInError) {
      return <Typography color="error">{signInState.signInStatus}</Typography>;
    } else {
      return null;
    }
  };

  const Fade = React.forwardRef(function Fade(props, ref) {
    const { in: open, children, onEnter, onExited, ...other } = props;
    const style = useSpring({
      from: { opacity: 0 },
      to: { opacity: open ? 1 : 0 },
      onStart: () => {
        if (open && onEnter) {
          onEnter();
        }
      },
      onRest: () => {
        if (!open && onExited) {
          onExited();
        }
      },
    });

    return (
      <animated.div ref={ref} style={style} {...other}>
        {children}
      </animated.div>
    );
  });

  Fade.propTypes = {
    children: PropTypes.element,
    in: PropTypes.bool.isRequired,
    onEnter: PropTypes.func,
    onExited: PropTypes.func,
  };

  const EmailError = () => {
    if (emailError !== "") {
      return <Typography color="error">{emailError}</Typography>;
    } else {
      return null;
    }
  };

  const PasswordError = () => {
    if (passwordError !== "") {
      return <Typography color="error">{passwordError}</Typography>;
    } else {
      return null;
    }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
      <Typography variant="h3">Sign In</Typography>
      <div className={classes.fieldContainer}>
        <TextField
          id="standard-password-input"
          label="Email"
          type="text"
          autoComplete="current-password"
          size="medium"
          value={email}
          onChange={(e) => changeEmail(e.target.value)}
        />
        <EmailError />
        <TextField
          id="standard-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          size="medium"
          value={password}
          onChange={(e) => changePassword(e.target.value)}
        />
        <PasswordError />
      </div>
      {showError()}
      {renderButton()}
      <Typography variant="body1">
        Don't have an account? Sign up <Link to="/sign-up">here</Link>
      </Typography>
    </form>
  );
};

const mapStateToPros = (state) => ({
  signInState: state.signInState,
});

export default connect(mapStateToPros, { signIn })(SignIn);
