import * as React from "react";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  Snackbar,
  Alert,
  SnackbarCloseReason,
  SelectChangeEvent,
} from "@mui/material";
import axios from "axios";
import Navbar from "./components/Navbar.tsx";
import TodoStrip from "./components/TodoStrip.tsx";
import StatusBar from "./components/StatusBar.tsx";

type Todo = {
  id: string;
  description: string;
  added_date: string;
  due_date: string;
  status: string;
  priority: string;
};

interface TodolistContainerProps {
  user_id: string;
  username: string;
}

const dummyTodos: Todo[] = [
  {
    id: "1",
    description: "First Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "pending",
    priority: "low",
  },
  {
    id: "2",
    description: "Second Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "pending",
    priority: "low",
  },
  {
    id: "3",
    description: "Third Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "pending",
    priority: "low",
  },
  {
    id: "4",
    description: "Compl 1 Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "completed",
    priority: "low",
  },
  {
    id: "5",
    description: "Compl 2 Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "completed",
    priority: "low",
  },
  {
    id: "6",
    description: "Compl 3 Todo",
    added_date: "2024-12-31",
    due_date: "2024-12-31",
    status: "completed",
    priority: "low",
  },
];

const validationSchema = Yup.object({
  description: Yup.string()
    .max(256, "Description should not exceed 256 characters")
    .required("Description is required"),
  date: Yup.date()
    .transform((value, originalValue) =>
      originalValue ? new Date(originalValue) : null
    ) // Ensure proper conversion to a JavaScript Date object
    .min(
      new Date().setHours(0, 0, 0, 0), // Today's date starting at midnight
      "Date must be today or a future date"
    )
    .required("Date is required"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Invalid priority")
    .required("Priority is required"),
});

export default function TodolistContainer({
  user_id,
  username,
}: TodolistContainerProps) {
  // Initialize states with dummy data
  const { user_id: user_id_url } = useParams<{ user_id: string }>();

  const [pendingTodos, setPendingTodos] = React.useState<Todo[]>(
    dummyTodos.filter((todo) => todo.status === "pending")
  );
  const [completedTodos, setCompletedTodos] = React.useState<Todo[]>(
    dummyTodos.filter((todo) => todo.status === "completed")
  );

  const [activeFilter, setActiveFilter] = React.useState(false);

  const [username_url, setUserNameUrl] = React.useState(username || "");

  const [toast, setToast] = React.useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [sortCriterion, setSortCriterion] = React.useState("added-date"); // Initialize to default sorting criterion

  // Handler to update a todo's status
  const handleStatusToggle = (todoId: string, newStatus: string) => {
    // Move the todo to the correct list based on the new status
    if (newStatus === "completed") {
      // Remove from pending and add to completed
      setPendingTodos((todos) => todos.filter((todo) => todo.id !== todoId));
      setCompletedTodos((todos) => [
        ...todos,
        ...pendingTodos
          .filter((todo) => todo.id === todoId)
          .map((todo) => ({ ...todo, status: "completed" })),
      ]);
    } else {
      // Remove from completed and add to pending
      setCompletedTodos((todos) => todos.filter((todo) => todo.id !== todoId));
      setPendingTodos((todos) => [
        ...todos,
        ...completedTodos
          .filter((todo) => todo.id === todoId)
          .map((todo) => ({ ...todo, status: "pending" })),
      ]);
    }
  };

  React.useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Replace this IP address with your actual URL later
        const todosResponse = await axios.get(
          user_id
            ? `${process.env.REACT_APP_API_BASE_URL}/api/users/${user_id}/todos`
            : `${process.env.REACT_APP_API_BASE_URL}/api/users/${user_id_url}/todos`
        );
        console.log(todosResponse.data);

        const todos: Todo[] = todosResponse.data;

        // Separate pending and completed todos
        const pending = todos.filter((todo) => todo.status === "pending");
        const completed = todos.filter((todo) => todo.status === "completed");

        setPendingTodos(pending);
        setCompletedTodos(completed);

        // Fetch username by user ID
        const userResponse = await axios.get(
          user_id
            ? `${process.env.REACT_APP_API_BASE_URL}/api/users/${user_id}`
            : `${process.env.REACT_APP_API_BASE_URL}/api/users/${user_id_url}`
        );
        setUserNameUrl(userResponse.data.username);
      } catch (error) {
        console.error("Error fetching todos:", error);
        // Fallback to dummy JSON data (already set in state)
      }
    };

    fetchTodos(); // Call the async function inside `useEffect`
  }, [user_id, user_id_url]); // Empty dependency array ensures this runs once when the component mounts

  const handleSubmit = async (values: {
    description: string;
    date: string;
    priority: string;
  }) => {
    try {
      // Ensure added_date and due_date are formatted properly
      const currentDate = new Date().toISOString().split("T")[0]; // Today's date in ISO format
      const formattedDueDate = values.date
        ? new Date(values.date).toISOString().split("T")[0]
        : null; // Convert date string to ISO

      const newTodoRequest = {
        description: values.description,
        added_date: currentDate, // Current date
        due_date: formattedDueDate, // Due date from the form
        status: "pending", // Default status for new todos
        priority: values.priority,
        user_id, // Assuming this variable holds the current user ID
      };

      // Send the request to create a new todo
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/todos`,
        newTodoRequest
      );

      if (response.status === 201) {
        const newTodoResponse = response.data; // Ensure API returns the newly created todo

        // Convert backend response to match the frontend Todo type
        const newTodo: Todo = {
          id: newTodoResponse.id, // Ensure the backend returns an `id` field
          description: newTodoResponse.description,
          added_date: newTodoResponse.added_date,
          due_date: newTodoResponse.due_date || "", // Ensure an empty string if `due_date` is null
          status: newTodoResponse.status, // Adjust to "completed" or "pending"
          priority: newTodoResponse.priority,
        };

        // Update the appropriate state list
        if (newTodo.status === "pending") {
          setPendingTodos((prev) => [...prev, newTodo]);
        } else {
          setCompletedTodos((prev) => [...prev, newTodo]);
        }

        // Optionally clear the form fields
        formik.resetForm(); // Resets form fields to initial values

        showToast("Todo created successfully!", "success");
      } else {
        showToast("Failed to create todo.", "error");
      }
    } catch (error) {
      showToast(
        "Error creating todo: " + (error.response?.data.error || error.message),
        "error"
      );
    }
  };

  const handleFilterChange = (filter: boolean) => {
    setActiveFilter(filter);
  };

  const handleFilterSelectChange = (value: string) => {
    // Map string values to numeric states
    const filterValue = value === "pending" ? false : true;
    setActiveFilter(filterValue);
  };

  // Show the toast message
  const showToast = (message: string, severity: "success" | "error") => {
    setToast({ open: true, message, severity });
  };

  // Close the toast
  const handleCloseToast = (
    event: Event | React.SyntheticEvent<any, Event>,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const sortTodos = (todos: Todo[], criterion: string) => {
    return todos.sort((a, b) => {
      const dateA = new Date(
        criterion === "added-date" ? a.added_date : a.due_date
      );
      const dateB = new Date(
        criterion === "added-date" ? b.added_date : b.due_date
      );
      return dateA < dateB ? -1 : 1;
    });
  };

  const handleSortChange = (e: SelectChangeEvent) => {
    const value = e.target.value as string;
    setSortCriterion(value);
  };

  const sortedTodos = sortTodos(
    activeFilter ? completedTodos : pendingTodos,
    sortCriterion
  );

  const handleTodoEdit = (
    todoId: string,
    newDescription: string,
    newStatus: string,
    newPriority: string,
    newDueDate: string
  ) => {
    // If the new status is "pending," update the pendingTodos list
    if (newStatus === "pending") {
      // Remove the todo from the completed list if it was completed
      setCompletedTodos((todos) => todos.filter((todo) => todo.id !== todoId));

      // Add or update the todo in the pendingTodos list
      setPendingTodos((todos) =>
        todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                description: newDescription,
                status: newStatus,
                priority: newPriority,
                due_date: newDueDate,
              }
            : todo
        )
      );
    } else {
      // Remove the todo from the pending list if it was pending
      setPendingTodos((todos) => todos.filter((todo) => todo.id !== todoId));

      // Add or update the todo in the completedTodos list
      setCompletedTodos((todos) =>
        todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                description: newDescription,
                status: newStatus,
                priority: newPriority,
                due_date: newDueDate,
              }
            : todo
        )
      );
    }
  };

  // Function to handle the deletion of a todo item
  const handleTodoDelete = (todoId: string, status: string) => {
    if (status === "pending") {
      // Remove the todo from the pending list
      setPendingTodos((todos) => todos.filter((todo) => todo.id !== todoId));
    } else if (status === "completed") {
      // Remove the todo from the completed list
      setCompletedTodos((todos) => todos.filter((todo) => todo.id !== todoId));
    }
  };

  const formik = useFormik({
    initialValues: {
      description: "",
      date: "",
      priority: "low",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: "#d3dfed",
            height: "100%",
            margin: "5%",
            borderRadius: "20px",
            padding: "5%",
          }}
        >
          <Navbar username={username || username_url} />
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              bgcolor: "white",
              padding: "24px",
              borderRadius: "20px",
              boxShadow: "2px 5px 20px #696363",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              marginTop: "20px",
            }}
          >
            <TextField
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              variant="outlined"
              value={formik.values.description}
              onBlur={formik.handleBlur}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              onChange={formik.handleChange}
              helperText={
                formik.touched.description && formik.errors.description
              }
              sx={{ mb: 2 }}
            />
            <TextField
              id="date"
              label="Date"
              type="date"
              name="date"
              InputLabelProps={{ shrink: true }}
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              sx={{ mb: 2 }}
            />
            <InputLabel htmlFor="priority" sx={{ mt: 2, mb: 1 }}>
              Priority
            </InputLabel>
            <Select
              label="Priority"
              id="priority"
              name="priority"
              variant="outlined"
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.priority && Boolean(formik.errors.priority)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="low">Low Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
            </Select>
            {formik.touched.priority && formik.errors.priority && (
              <div style={{ color: "red" }}>{formik.errors.priority}</div>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mb: 2 }}
            >
              Add
            </Button>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ marginY: "20px", bgcolor: "#a0a3a6", height: "5px" }}
            />
            <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <Box sx={{ width: "50%", paddingRight: "8px" }}>
                <Box sx={{ mb: 2 }}>
                  <InputLabel htmlFor="filter" sx={{ mt: 2, mb: 1 }}>
                    Filter
                  </InputLabel>
                  <Select
                    label="Filter"
                    id="filter"
                    variant="outlined"
                    defaultValue="pending"
                    onChange={(e) => handleFilterSelectChange(e.target.value)}
                    sx={{ width: "100%" }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </Box>
              </Box>
              <Box sx={{ width: "50%", paddingLeft: "8px" }}>
                <Box sx={{ mb: 2 }}>
                  <InputLabel htmlFor="sort" sx={{ mt: 2, mb: 1 }}>
                    Sort
                  </InputLabel>
                  <Select
                    label="Sort"
                    id="sort"
                    variant="outlined"
                    value={sortCriterion}
                    onChange={handleSortChange}
                    sx={{ width: "100%" }}
                  >
                    <MenuItem value="added-date">Added date</MenuItem>
                    <MenuItem value="due-date">Due date</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              backgroundColor: "white",
              marginTop: "30px",
              borderRadius: "10px",
              boxShadow: "2px 5px 20px #696363",
              height: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StatusBar
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
            {sortedTodos.map((todo) => (
              <TodoStrip
                key={todo.id}
                description={todo.description}
                priority={todo.priority}
                status={todo.status}
                dueDate={todo.due_date}
                todoId={todo.id}
                onDelete={handleTodoDelete}
                onEdit={(newDescription, newStatus, newPriority, newDueDate) =>
                  handleTodoEdit(
                    todo.id,
                    newDescription,
                    newStatus,
                    newPriority,
                    newDueDate
                  )
                }
                onToggleStatus={handleStatusToggle}
                showToast={showToast}
                user_id={user_id}
              />
            ))}
          </Box>
        </Box>
      </Container>
      {/* Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
      >
        <Alert onClose={handleAlertClose} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
