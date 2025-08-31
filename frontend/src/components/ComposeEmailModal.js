import { useState } from "react";

export default function ComposeEmailModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [showEnhanceWithAI, setShowEnhanceWithAI] = useState(false);
  const [aIPrompt, setAIPrompt] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/emails/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      handleClose();
      onSubmit();
    } catch (error) {
      alert("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
    });
    onClose();
  };

  const enhanceWithAI = async () => {
    if (!aIPrompt) {
      alert("Please provide the purpose of the email.");
      return;
    }

    try {
      const response = await fetch("/api/emails/enhance-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientName: formData.to,
          messageContext: aIPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          subject: data.subject,
          body: data.body,
        }));

        setAIPrompt("");
        setShowEnhanceWithAI(false);
      } else {
        alert("Failed to enhance email. Please try again.");
      }
    } catch (error) {
      alert("Failed to enhance email. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "5%",
        left: "40%",
      }}
    >
      <div>
        <div style={{ display: "flex" }}>
          <h2>Compose New Email</h2>
          <button
            style={{
              height: "20px",
            }}
            onClick={handleClose}
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="to">To * </label>
            <input
              type="email"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              required
              placeholder="recipient@example.com"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="cc">CC </label>
            <input
              type="email"
              id="cc"
              name="cc"
              value={formData.cc}
              onChange={handleInputChange}
              placeholder="cc@example.com"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="bcc">BCC </label>
            <input
              type="email"
              id="bcc"
              name="bcc"
              value={formData.bcc}
              onChange={handleInputChange}
              placeholder="bcc@example.com"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="subject">Subject * </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              placeholder="Email subject"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor="body">Body *</label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              required
              rows={8}
              placeholder="Write your email content here..."
            />
          </div>

          <div
            style={{
              marginTop: "16px",
            }}
          >
            {!showEnhanceWithAI ? (
              <button type="button" onClick={() => setShowEnhanceWithAI(true)}>
                AI ✨
              </button>
            ) : (
              <div>
                <input
                  type="text"
                  id="AIPrompt"
                  name="AIPrompt"
                  value={aIPrompt || ""}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="What is this email about?"
                />
                <button type="button" onClick={enhanceWithAI}>
                  Enhance with AI
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: "16px" }}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
