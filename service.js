export const respondToComment = async ({ commentId, message }) =>
  fetch(`https://graph.instagram.com/v22.0/${commentId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
