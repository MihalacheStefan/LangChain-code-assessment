export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const response = await fetch("http://localhost:3001/emails");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch emails",
        error: error.message,
      });
    }
  } else if (req.method === "POST") {
    try {
      const response = await fetch("http://localhost:3001/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create email",
        error: error.message,
      });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
