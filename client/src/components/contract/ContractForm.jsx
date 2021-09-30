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
import { withRouter } from "react-router-dom";
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
}));

function getSteps() {
  return ["Terms", "Description"];
}

function getStepContent(stepIndex, termsProps, descriptionProps) {
  switch (stepIndex) {
    case 0:
      return <TermsForm termsProps={termsProps} />;

    case 1:
      return <DescriptionForm descriptionProps={descriptionProps} />;
    default:
      return "unknown step";
  }
}

const TermsForm = ({ termsProps }) => {
  const {
    contractTitle,
    setContractTitle,
    bidType,
    fixedBidAmount,
    hourlyBidAmount,
  } = termsProps;

  const classes = useStyles();

  const form = (
    <div className={classes.fieldContainer}>
      {" "}
      <TextField
        label={bidType === "fixed" ? "$ Fixed price" : "$ Hourly Rate"}
        variant="outlined"
        fullWidth
        margin="normal"
        defaultValue={
          bidType === "fixed" ? "$ " + fixedBidAmount : "$ " + hourlyBidAmount
        }
        inputProps={{ readOnly: true }}
        size="small"
      />
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 3, maxLength: 50 }}
        id="contractTitle"
        label="Contract Title"
        value={contractTitle}
        variant="outlined"
        placeholder="Enter the title of contract or simply enter job title"
        fullWidth
        margin="normal"
        onChange={(e) => setContractTitle(e.target.value)}
        required
        size="small"
      />
    </div>
  );

  return <>{form}</>;
};
const DescriptionForm = ({ descriptionProps }) => {
  const { setFile, workDetails, setWorkDetails } = descriptionProps;
  const classes = useStyles();

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="text"
        inputProps={{ inputMode: "text" }}
        id="workdetails"
        label="Work Details"
        value={workDetails}
        variant="outlined"
        placeholder="Write about work that you will give to freelancer"
        fullWidth
        multiline
        cols={12}
        rows={8}
        rowsMax={8}
        margin="normal"
        onChange={(e) => setWorkDetails(e.target.value)}
        required
      />

      <input
        onChange={(e) => {
          const file = e.target.files[0];
          setFile(file);
        }}
        accept="application/pdf, application/docx, application/vnd.oasis.opendocument.text"
        type="file"
        required
      />
    </div>
  );
};

const ContractForm = ({
  jobId,
  freelancerId,
  employerId,
  proposalId,
  token,
  history,
  bidType,
  fixedBidAmount,
  hourlyBidAmount,
}) => {
  const classes = useStyles();

  const [contractTitle, setContractTitle] = useState("");
  const [file, setFile] = useState("");
  const [workDetails, setWorkDetails] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const steps = getSteps();

  const termsProps = {
    bidType,
    fixedBidAmount,
    hourlyBidAmount,
    contractTitle,
    setContractTitle,
  };

  const descriptionProps = {
    file,
    workDetails,
    setFile,
    setWorkDetails,
  };

  const isStepOptional = (step) => {
    return step === 2 || step === 3;
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
    createContract();
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

  const createContract = () => {
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("freelancerId", freelancerId);
    formData.append("employerId", employerId);
    formData.append("contractTitle", contractTitle);
    formData.append("bidType", bidType);
    formData.append("workDetails", workDetails);
    formData.append("workDetailsFile", file);
    if (bidType === "fixed") {
      formData.append("fixedBidAmount", fixedBidAmount);
    } else {
      formData.append("hourlyBidAmount", hourlyBidAmount);
    }

    setLoading(true);
    Axios.post("/api/v1/job/hireFreelancer", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setLoading(false);
        setError("");
        setActiveStep(activeStep + 1);
        history.push(`/employer/my-jobs/${jobId}/proposal/${proposalId}`);
      })
      .catch((err) => {
        setError(err.response.data.data.error);
        setLoading(false);
      });
  };
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

      <form
        encType="multipart/form-data"
        className={classes.formContainer}
        onSubmit={handleNext}
      >
        {getStepContent(activeStep, termsProps, descriptionProps)}
        {error ? (
          <Typography color="error" style={{ marginTop: "15px" }}>
            {error}
          </Typography>
        ) : null}
        <div style={{ marginTop: "30px", display: "flex" }}>
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

export default withRouter(ContractForm);
