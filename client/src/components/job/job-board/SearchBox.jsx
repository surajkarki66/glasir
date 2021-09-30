import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function CustomizedInputBase({ refreshFunction, placeholder }) {
  const [text, setText] = useState("");
  const classes = useStyles();
  const submitHandler = (e) => {
    e.preventDefault();
    refreshFunction(text);
  };

  return (
    <Paper
      component="form"
      className={classes.root}
      onSubmit={(e) => submitHandler(e)}
    >
      <InputBase
        className={classes.input}
        placeholder={placeholder}
        inputProps={{ "aria-label": "search google maps" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
      >
        <SearchIcon />
      </IconButton>
      <MenuIcon />
    </Paper>
  );
}
