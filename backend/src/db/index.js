import knex from "knex";

const knexInstance = knex({
  client: "sqlite3", // or 'better-sqlite3'
  connection: {
    filename: "./dev.sqlite3",
  },
});

class DB {
  static async addLead(data) {
    return knexInstance("leads").insert(data);
  }

  static async getAllEmails() {
    return knexInstance("emails").select("*");
  }

  static async addEmail(emailData) {
    return knexInstance("emails").insert(emailData).returning("*");
  }
}

export default DB;
