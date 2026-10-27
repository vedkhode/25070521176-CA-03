import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../api.js";

export default function Todos() {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/todos")
      .then(setTodos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(event) {
    event.preventDefault();
    const value = title.trim();

    if (!value) {
      return;
    }

    setError("");

    try {
      const todo = await apiRequest("/todos", {
        method: "POST",
        body: JSON.stringify({ title: value }),
      });
      setTodos((current) => [todo, ...current]);
      setTitle("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(todo) {
    setError("");

    try {
      const updated = await apiRequest(`/todos/${todo._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !todo.completed }),
      });
      setTodos((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError("");

    try {
      await apiRequest(`/todos/${id}`, { method: "DELETE" });
      setTodos((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function startEditing(todo) {
    setEditingId(todo._id);
    setEditingTitle(todo.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function saveEditing(todo) {
    const value = editingTitle.trim();

    if (!value) {
      return;
    }

    if (value === todo.title) {
      cancelEditing();
      return;
    }

    setError("");

    try {
      const updated = await apiRequest(`/todos/${todo._id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: value }),
      });
      setTodos((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      cancelEditing();
    } catch (err) {
      setError(err.message);
    }
  }

  const remaining = todos.filter((todo) => !todo.completed).length;

  return (
    <main className="app-page">
      <header className="app-header">
        <div>
          <h1>My Todos</h1>
          <p className="muted">{user?.email}</p>
        </div>
        <button type="button" className="btn ghost" onClick={logout}>
          Log out
        </button>
      </header>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to be done?"
          maxLength={200}
          aria-label="New todo title"
        />
        <button type="submit" className="btn primary">
          Add
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <section className="todo-panel">
        {loading ? (
          <p className="empty">Loading todos...</p>
        ) : todos.length === 0 ? (
          <p className="empty">Nothing here yet. Add your first todo.</p>
        ) : (
          <>
            <ul className="todo-list">
              {todos.map((todo) => (
                <li
                  key={todo._id}
                  className={`todo-item${todo.completed ? " done" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                    aria-label={`Mark "${todo.title}" as ${
                      todo.completed ? "incomplete" : "complete"
                    }`}
                  />

                  {editingId === todo._id ? (
                    <input
                      className="edit-input"
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          saveEditing(todo);
                        }
                        if (event.key === "Escape") {
                          cancelEditing();
                        }
                      }}
                      maxLength={200}
                      autoFocus
                    />
                  ) : (
                    <span className="todo-title" onDoubleClick={() => startEditing(todo)}>
                      {todo.title}
                    </span>
                  )}

                  <div className="todo-actions">
                    {editingId === todo._id ? (
                      <>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => saveEditing(todo)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="link-button"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => startEditing(todo)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="link-button danger"
                          onClick={() => handleDelete(todo._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="todo-footer">
              {remaining} of {todos.length} remaining
            </p>
          </>
        )}
      </section>
    </main>
  );
}
