import * as React from "react";
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
  status: string; // `true` for completed, `false` for pending
  priority: string;
};

interface TodolistContainerProps {
  user_id: string;
  username: string;
}

export default function TodolistContainer({
  user_id,
  username,
}: TodolistContainerProps) {
  // Dummy JSON data
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

  // Initialize states with dummy data
  const [pendingTodos, setPendingTodos] = React.useState<Todo[]>(
    dummyTodos.filter((todo) => todo.status === "pending")
  );
  const [completedTodos, setCompletedTodos] = React.useState<Todo[]>(
    dummyTodos.filter((todo) => todo.status === "completed")
  );
  const [activeFilter, setActiveFilter] = React.useState(false);

  React.useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Replace this IP address with your actual URL later
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${user_id}/todos`
        );
        console.log(response.data);
        const todos: Todo[] = response.data;

        // Separate pending and completed todos
        const pending = todos.filter((todo) => todo.status === "pending");
        const completed = todos.filter((todo) => todo.status === "completed");

        setPendingTodos(pending);
        setCompletedTodos(completed);
      } catch (error) {
        console.error("Error fetching todos:", error);
        // Fallback to dummy JSON data (already set in state)
      }
    };

    fetchTodos(); // Call the async function inside `useEffect`
  }, []); // Empty dependency array ensures this runs once when the component mounts

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission logic here
  };

  const handleFilterChange = (filter: boolean) => {
    setActiveFilter(filter);
  };

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
          <Navbar />
          <Box
            component="form"
            onSubmit={handleSubmit}
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
              id="outlined-textarea"
              label="Description"
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              id="date"
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <InputLabel htmlFor="priority" sx={{ mt: 2, mb: 1 }}>
              Priority
            </InputLabel>
            <Select
              label="Priority"
              id="priority"
              variant="outlined"
              defaultValue="low"
              sx={{ mb: 2 }}
            >
              <MenuItem value="low">Low Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
            </Select>
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
                    defaultValue="added-date"
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
            {(activeFilter ? completedTodos : pendingTodos).map((todo) => (
              <TodoStrip
                key={todo.id}
                description={todo.description}
                priority={todo.priority}
                onDelete={() => {}}
                onEdit={() => {}}
                // dueDate={todo.due_date.toISOString().split("T")[0]}
                dueDate={todo.due_date}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </React.Fragment>
  );
}
