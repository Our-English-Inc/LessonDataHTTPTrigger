const { app } = require("@azure/functions");

app.http("loginRedirect", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req) => {
    const target = req.query.get("target");

    return {
      status: 302,
      headers: {
        Location: target || "https://yourgithubsite.com"
      }
    };
  }
});
