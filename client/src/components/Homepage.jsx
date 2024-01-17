import React, { useEffect, useState } from "react";
import "./homepage.css";
import AddIcon from "@mui/icons-material/Add.js";
import EditIcon from "@mui/icons-material/Edit.js";
import DeleteIcon from "@mui/icons-material/Delete.js";
import CheckIcon from "@mui/icons-material/Check.js";

export default function Homepage() {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUidd, setTempUidd] = useState("");

  const API_BASE_URL = "http://localhost:3000";

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreateTodo = async () => {
    try {
      await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: todo }),
      });
    } catch (error) {
      console.error("Error creating todo:", error);
    } finally {
      fetchTodos();
      setTodo("");
    }
  };

  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTodo(todo.description);
    setTempUidd(todo.id);
  };

  const handleEditConfirm = async () => {
    try {
      await fetch(`${API_BASE_URL}/todos/${tempUidd}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: todo }),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setTodo("");
      setIsEdit(false);
      fetchTodos();
    }
  };

  const handleDelete = async (uid) => {
    try {
      await fetch(`${API_BASE_URL}/todos/${uid}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
    } finally {
      fetchTodos();
    }
  };

  return (
    <div className="homepage">
      <input
        className="add-edit-input"
        type="text"
        placeholder="Add todo..."
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
      />

      {todos.map((todo) => (
        <div className="todo">
          <h1>{todo.description}</h1>
          <EditIcon
            fontSize="large"
            onClick={() => handleUpdate(todo)}
            className="edit-button"
          />
          <DeleteIcon
            fontSize="large"
            onClick={() => handleDelete(todo.id)}
            className="delete-button"
          />
        </div>
      ))}
      {isEdit ? (
        <div>
          <CheckIcon onClick={handleEditConfirm} className="add-confirm-icon" />
        </div>
      ) : (
        <div>
          <AddIcon onClick={handleCreateTodo} className="add-confirm-icon" />
        </div>
      )}
    </div>
  );
}
