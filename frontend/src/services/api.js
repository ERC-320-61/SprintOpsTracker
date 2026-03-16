export async function getItems() {
  
  return [
    {
      itemId: "item-001",
      title: "Create backlog page shell",
      status: "Backlog",
      priority: "High",
      storyPoints: 3,
      assignee: "Eric",
    },
    {
      itemId: "item-002",
      title: "Build sprint board placeholder",
      status: "Ready",
      priority: "Medium",
      storyPoints: 2,
      assignee: "Eric",
    },
    {
      itemId: "item-003",
      title: "Document frontend structure",
      status: "In Progress",
      priority: "Low",
      storyPoints: 1,
      assignee: "Eric",
    },
  ];
}