import { useEffect, useState } from "react";
import { getItems } from "../services/api";

function BacklogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getItems();
        setItems(data);
      } catch (err) {
        setError("Failed to load backlog items.");
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  if (loading) {
    return <p>Loading backlog items...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Backlog</h1>
      {items.length === 0 ? (
        <p>No backlog items found.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.itemId}>
              <strong>{item.title}</strong> - {item.status} - {item.priority} - {item.storyPoints} pts - {item.assignee}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BacklogPage;