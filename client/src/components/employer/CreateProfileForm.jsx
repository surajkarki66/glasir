import React, { useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter, Redirect } from "react-router-dom";
import IntlTelInput from "react-intl-tel-input";
import { CountryDropdown } from "react-country-region-selector";

import "react-intl-tel-input/dist/main.css";

import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "50vh",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "35vw",
    "& *": {
      marginTop: "5px",
    },
  },
  button: {
    marginRight: theme.spacing(2),
  },
  country: { height: "2.5rem" },
}));

function getSteps() {
  return ["Personal", "Company", "Location"];
}

function getStepContent(stepIndex, personalProps, companyProps, locationProps) {
  switch (stepIndex) {
    case 0:
      return <PersonalForm personalProps={personalProps} />;

    case 1:
      return <CompanyForm companyProps={companyProps} />;

    case 2:
      return <LocationForm locationProps={locationProps} />;

    default:
      return "unknown step";
  }
}

const PersonalForm = ({ personalProps }) => {
  const { personal, setPersonal } = personalProps;
  const classes = useStyles();
  const form = (
    <div className={classes.fieldContainer}>
      {" "}
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="First Name"
        variant="outlined"
        placeholder="Enter first name"
        margin="normal"
        value={personal.firstName}
        onChange={(e) =>
          setPersonal({
            ...personal,
            firstName: e.target.value,
          })
        }
        required
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="Last Name"
        variant="outlined"
        placeholder="Enter last name"
        margin="normal"
        value={personal.lastName}
        onChange={(e) =>
          setPersonal({
            ...personal,
            lastName: e.target.value,
          })
        }
        size="small"
        required
      />
      <IntlTelInput
        style={{ marginTop: "-10px" }}
        fieldName="Phone"
        preferredCountries={["np"]}
        onPhoneNumberChange={(
          isValid,
          value,
          selectedCountryData,
          fullNumber,
          extension
        ) => {
          const { dialCode } = selectedCountryData;
          setPersonal({
            ...personal,
            phone: { phoneNumber: "+" + dialCode + value },
          });
        }}
      />
    </div>
  );

  return <>{form}</>;
};
const CompanyForm = ({ companyProps }) => {
  const { company, setCompany } = companyProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="Company name"
        value={company.name}
        variant="outlined"
        placeholder="Enter company name"
        onChange={(e) => setCompany({ ...company, name: e.target.value })}
        required
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 10, maxLength: 32 }}
        label="Website"
        value={company.website}
        variant="outlined"
        placeholder="Enter website url"
        onChange={(e) => setCompany({ ...company, website: e.target.value })}
        size="small"
        required
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 2, maxLength: 32 }}
        label="Tagline"
        value={company.tagline}
        variant="outlined"
        placeholder="Enter tagline of your company"
        onChange={(e) => setCompany({ ...company, tagline: e.target.value })}
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 200 }}
        label="Description"
        value={company.description}
        variant="outlined"
        placeholder="Introduce your company in few sentences"
        multiline
        cols={12}
        minRows={3}
        maxRows={3}
        margin="normal"
        onChange={(e) =>
          setCompany({ ...company, description: e.target.value })
        }
        required
      />
    </div>
  );
};

const LocationForm = ({ locationProps }) => {
  const { location, setLocation } = locationProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <CountryDropdown
        name="Country"
        value={location.country}
        onChange={(val) => setLocation({ ...location, country: val })}
        classes={classes.country}
      />

      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="Street"
        value={location.street}
        variant="outlined"
        placeholder="Street"
        onChange={(e) => setLocation({ ...location, street: e.target.value })}
        required
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 70 }}
        label="City"
        value={location.city}
        variant="outlined"
        placeholder="City"
        onChange={(e) => setLocation({ ...location, city: e.target.value })}
        size="small"
        required
      />
      <TextField
        type="number"
        inputProps={{ inputMode: "numeric" }}
        label="Zip"
        variant="outlined"
        placeholder="Zip"
        s
        fullWidth
        margin="normal"
        onChange={(e) =>
          setLocation({ ...location, zip: Number(e.target.value) })
        }
        size="small"
      />
    </div>
  );
};

const CreateProfileForm = ({ token, history }) => {
  const classes = useStyles();
  const [success, setSuccess] = useState(false);
  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    phone: { phoneNumber: "" },
  });
  const [company, setCompany] = useState({
    name: "",
    website: "",
    tagline: "",
    description: "",
  });

  const [location, setLocation] = useState({
    country: "",
    city: "",
    street: "",
    zip: 0,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const steps = getSteps();

  const personalProps = {
    personal,
    setPersonal,
  };

  const companyProps = {
    company,
    setCompany,
  };

  const locationProps = {
    location,
    setLocation,
  };

  const isStepOptional = (step) => {
    return step === 3 || step === 4;
  };

  const isStepSkipped = (step) => {
    return skippedSteps.includes(step);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      setActiveStep(activeStep + 1);
      setSkippedSteps(
        skippedSteps.filter((skipItem) => skipItem !== activeStep)
      );
      return;
    }
    createProfile();
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSkip = () => {
    if (!isStepSkipped(activeStep)) {
      setSkippedSteps([...skippedSteps, activeStep]);
    }
    setActiveStep(activeStep + 1);
  };

  const createProfile = () => {
    const profileData = {
      firstName: personal.firstName,
      lastName: personal.lastName,
      phone: personal.phone,
      company,
      location,
    };
    setLoading(true);
    Axios.post("/api/v1/employer/create-profile", profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setError("");
        setLoading(false);
        setActiveStep(activeStep + 1);
        setSuccess(true);
      })
      .catch((err) => {
        setError(err.response.data.data.error);
        setLoading(false);
        setSuccess(false);
      });
  };
  if (success) {
    return <Redirect to="/employer/home" />;
  }
  return (
    <div>
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((step, index) => {
          const labelProps = {};
          const stepProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography
                variant="caption"
                align="center"
                style={{ display: "block" }}
              >
                optional
              </Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step {...stepProps} key={index}>
              <StepLabel {...labelProps}>{step}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <form className={classes.formContainer} onSubmit={handleNext}>
        {getStepContent(activeStep, personalProps, companyProps, locationProps)}
        {error ? (
          <Typography color="error" style={{ marginTop: "15px" }}>
            {error}
          </Typography>
        ) : null}
        <div style={{ display: "flex", marginTop: "10px" }}>
          {" "}
          <Button
            className={classes.button}
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
          >
            back
          </Button>
          {isStepOptional(activeStep) && (
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              onClick={handleSkip}
            >
              skip
            </Button>
          )}
          {loading ? (
            <div style={{ marginLeft: "30px", marginTop: "9px" }}>
              <CircularProgress size={20} />
            </div>
          ) : (
            <Button
              className={classes.button}
              variant="contained"
              color="primary"
              type="submit"
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default withRouter(CreateProfileForm);
