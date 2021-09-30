import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  FormControlLabel,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter, Redirect } from "react-router-dom";

import "react-intl-tel-input/dist/main.css";

import Axios from "../../axios-url";

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    //height: "100vh",
  },
  fieldContainer: {
    display: "grid",
    minWidth: "40vw",
    "& *": {
      // marginTop: "5px",
    },
  },
  button: {
    marginRight: theme.spacing(2),
  },
}));

function getSteps() {
  return ["Basic information", "Expertise", "Type", "Budget"];
}

function getStepContent(
  stepIndex,
  basicProps,
  expertiseProps,
  typeProps,
  budgetProps
) {
  switch (stepIndex) {
    case 0:
      return <BasicForm basicProps={basicProps} />;

    case 1:
      return <ExpertiseForm expertiseProps={expertiseProps} />;

    case 2:
      return <TypeForm typeProps={typeProps} />;

    case 3:
      return <BudgetForm budgetProps={budgetProps} />;

    default:
      return "unknown step";
  }
}

const BasicForm = ({ basicProps }) => {
  const { basic, setBasic } = basicProps;
  const classes = useStyles();
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
  const form = (
    <div className={classes.fieldContainer}>
      {" "}
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 5, maxLength: 255 }}
        label="Title"
        variant="outlined"
        placeholder="Enter the name of your job post"
        margin="normal"
        value={basic.title}
        onChange={(e) => setBasic({ ...basic, title: e.target.value })}
        required
        size="small"
      />
      <TextField
        variant="outlined"
        select
        label="Job category"
        value={basic.category}
        onChange={(e) => setBasic({ ...basic, category: e.target.value })}
        helperText="Lets categorize your job"
        margin="normal"
        required
        size="small"
      >
        {categories.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="text"
        inputProps={{ inputMode: "text", minLength: 50 }}
        label="Description"
        value={basic.description}
        onChange={(e) => setBasic({ ...basic, description: e.target.value })}
        variant="outlined"
        placeholder="Give a brief introduction of your job"
        fullWidth
        multiline
        cols={12}
        minRows={3}
        maxRows={3}
        margin="normal"
        required
      />
    </div>
  );

  return <>{form}</>;
};
const ExpertiseForm = ({ expertiseProps }) => {
  const { expertise, setExpertise, skills, setSkills } = expertiseProps;

  const classes = useStyles();

  const expertiseLevels = [
    {
      value: "Beginner",
      label: "Beginner",
      description: "Looking for someone relatively new to this field",
    },
    {
      value: "Intermediate",
      label: "Intermediate",
      description: "Looking for substantial experience in this field",
    },
    {
      value: "Expert",
      label: "Expert",
      description: "Looking for comprehensive and deep expertise in this field",
    },
  ];

  const handleChangeInput = (id, event) => {
    const newSkills = skills.map((i) => {
      if (id === i.id) {
        i[event.target.name] = event.target.value;
      }
      return i;
    });

    setSkills(newSkills);
  };

  const handleAddFields = () => {
    setSkills([...skills, { id: uuidv4(), name: "" }]);
  };

  const handleRemoveFields = (id) => {
    const values = [...skills];
    values.splice(
      values.findIndex((value) => value.id === id),
      1
    );
    setSkills(values);
  };

  return (
    <div className={classes.fieldContainer}>
      {skills.map((s) => (
        <div key={s.id}>
          <TextField
            name="name"
            label="Skill"
            variant="outlined"
            value={s.name}
            required
            inputProps={{ inputMode: "text", minLength: 2 }}
            onChange={(event) => handleChangeInput(s.id, event)}
            size="small"
          />

          <IconButton
            disabled={skills.length === 1}
            onClick={() => handleRemoveFields(s.id)}
          >
            <RemoveIcon />
          </IconButton>
          <IconButton onClick={handleAddFields}>
            <AddIcon />
          </IconButton>
        </div>
      ))}

      <RadioGroup
        aria-label="expertise-level"
        name="Expertise level"
        value={expertise.expertiseLevel}
        onChange={(e) =>
          setExpertise({ ...expertise, expertiseLevel: e.target.value })
        }
      >
        <Typography variant="subtitle1"> Expertise level:</Typography>
        {expertiseLevels.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio required={true} />}
            label={
              <Typography>
                {option.label} <i>({option.description})</i>
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </div>
  );
};

const TypeForm = ({ typeProps }) => {
  const { type, setType } = typeProps;
  const classes = useStyles();
  const projectTypes = [
    {
      value: "onetime",
      label: "One-time project",
      description: "Find the right skills for a short-term need",
    },
    {
      value: "ongoing",
      label: "Ongoing project",
      description: "Find a skilled resource for an extended engagement",
    },
  ];

  return (
    <div className={classes.fieldContainer}>
      <TextField
        type="number"
        inputProps={{ inputMode: "numeric", min: 1 }}
        label="Project Length"
        value={type.projectLengthInHours}
        variant="outlined"
        placeholder="Enter the project duration in hours"
        onChange={(e) =>
          setType({ ...type, projectLengthInHours: Number(e.target.value) })
        }
        required
        size="small"
        helperText="Calculate and enter the time required to complete your project in hours"
      />
      <RadioGroup
        aria-label="project-type"
        name="Project-Type"
        value={type.projectType}
        onChange={(e) => setType({ ...type, projectType: e.target.value })}
        style={{ marginTop: "5px" }}
      >
        <Typography variant="subtitle1"> Project Type:</Typography>
        {projectTypes.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio required={true} />}
            label={
              <Typography>
                {option.label} <i>({option.description})</i>
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </div>
  );
};

const BudgetForm = ({ budgetProps }) => {
  const { pay, setPay } = budgetProps;
  const classes = useStyles();
  const payTypes = [
    { value: "hourly", label: "Pay by the hour" },
    { value: "fixed", label: "Pay a fixed price" },
  ];
  return (
    <div className={classes.fieldContainer}>
      <TextField
        select
        label="Pay type"
        value={pay.type}
        onChange={(e) => setPay({ ...pay, type: e.target.value })}
        required
        size="small"
        variant="outlined"
      >
        {payTypes.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {pay.type === "fixed" ? (
        <TextField
          type="number"
          inputProps={{ inputMode: "numeric", min: 1 }}
          label="Fixed price ($)"
          value={pay.price.amount}
          variant="outlined"
          placeholder="Enter the fixed price"
          onChange={(e) =>
            setPay({
              ...pay,
              price: { amount: Number(e.target.value) },
            })
          }
          style={{ marginTop: "30px" }}
          required
          size="small"
          helperText="Do you have specific budget?"
          startadornment={<InputAdornment position="start">$</InputAdornment>}
        />
      ) : (
        <>
          {" "}
          <TextField
            type="number"
            inputProps={{ inputMode: "numeric", min: 1 }}
            label="Minimum hourly rate ($)"
            value={pay.price.minRate}
            variant="outlined"
            placeholder="Enter the minimum hourly rate"
            onChange={(e) =>
              setPay({
                ...pay,
                price: {
                  ...pay.price,
                  minRate: Number(e.target.value),
                },
              })
            }
            required
            size="small"
            startadornment={<InputAdornment position="start">$</InputAdornment>}
            style={{ marginTop: "30px" }}
          />
          <TextField
            type="number"
            inputProps={{ inputMode: "numeric", min: 1 }}
            label="Maximum hourly rate ($)"
            value={pay.price.maxRate}
            variant="outlined"
            placeholder="Enter the maximum hourly rate"
            onChange={(e) =>
              setPay({
                ...pay,
                price: {
                  ...pay.price,
                  maxRate: Number(e.target.value),
                },
              })
            }
            startadornment={<InputAdornment position="start">$</InputAdornment>}
            required
            size="small"
            style={{ marginTop: "30px" }}
          />
        </>
      )}
    </div>
  );
};

const CreateJobForm = ({ token, employer }) => {
  const classes = useStyles();
  const [success, setSuccess] = useState(false);
  const [basic, setBasic] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [expertise, setExpertise] = useState({
    expertiseLevel: "",
  });
  const [skills, setSkills] = useState([{ id: uuidv4(), name: "" }]);

  const [type, setType] = useState({
    projectType: "",
    projectLengthInHours: 0,
  });

  const [pay, setPay] = useState({
    type: "",
    price: {
      amount: 0,
      minRate: 0,
      maxRate: 0,
    },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [skippedSteps, setSkippedSteps] = useState([]);
  const steps = getSteps();

  const basicProps = {
    basic,
    setBasic,
  };

  const expertiseProps = {
    expertise,
    setExpertise,
    skills,
    setSkills,
  };

  const typeProps = {
    type,
    setType,
  };

  const payProps = {
    pay,
    setPay,
  };
  const isStepOptional = (step) => {
    return step === 4 || step === 5;
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
    createJob();
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

  const createJob = () => {
    setLoading(true);
    const newSkills = skills.map((s) => {
      return s.name;
    });

    const jobData = {
      employerId: employer.data._id,
      title: basic.title,
      description: basic.description,
      category: basic.category,
      projectLengthInHours: type.projectLengthInHours,
      projectType: type.projectType,
      expertise: { ...expertise, skills: newSkills },
      pay,
    };
    if (pay.type === "hourly") {
      delete jobData.pay.price.amount;
    }

    Axios.post("/api/v1/job/createJob", jobData, {
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
    return <Redirect to="/employer/my-jobs" />;
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
        {getStepContent(
          activeStep,
          basicProps,
          expertiseProps,
          typeProps,
          payProps
        )}
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

export default withRouter(CreateJobForm);
