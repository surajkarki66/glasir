import React from "react";
import { Box } from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";

const AppPagination = ({ noOfPages, handleChange, page }) => {
  return (
    <Box py={3} display="flex" justifyContent="center">
      <Pagination
        color="primary"
        count={noOfPages}
        page={page}
        onChange={handleChange}
      />
    </Box>
  );
};

export default AppPagination;
