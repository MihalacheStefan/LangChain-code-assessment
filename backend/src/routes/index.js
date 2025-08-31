import DB from "../db/index.js";
import { generateEmail } from "../services/emailAssistant.js";

export default async function routes(fastify, options) {
  fastify.get("/ping", async (request, reply) => {
    return "pong\n";
  });

  fastify.get("/emails", async (request, reply) => {
    try {
      const emails = await DB.getAllEmails();
      return { emails };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  fastify.post("/emails", async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body } = request.body;

      if (!to || !subject || !body) {
        return reply.status(400).send({
          error:
            "Missing required fields. 'to', 'subject', and 'body' are required.",
        });
      }

      const emailData = {
        to,
        cc: cc || null,
        bcc: bcc || null,
        subject,
        body,
      };

      const newEmail = await DB.addEmail(emailData);
      return reply.status(201).send({ email: newEmail[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  fastify.post("/enhance-email", async (request, reply) => {
    try {
      const { recipientName, messageContext } = request.body;

      if (!messageContext) {
        return reply.status(400).send({
          error: "Missing required fields. 'messageContext' is required.",
        });
      }

      const result = await generateEmail(recipientName, messageContext);

      if (!result.success) {
        return reply.status(500).send({ error: result.error });
      }

      return reply.status(200).send({
        success: true,
        emailType: result.emailType,
        subject: result.subject,
        body: result.body,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
