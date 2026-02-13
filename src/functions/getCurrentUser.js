const { app } = require("@azure/functions");

app.http("getCurrentUser", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req, context) => {

    const principal = req.headers.get("x-ms-client-principal");

    if (!principal) {
      return {
        status: 401,
        jsonBody: { error: "Not authenticated - no principal header" }
      };
    }

    const decoded = JSON.parse(
      Buffer.from(principal, "base64").toString("utf8")
    );

    const claims = decoded.claims || [];

    const getClaim = (type) =>
      claims.find((c) => c.typ === type)?.val || null;

    return {
      jsonBody: {
        name: getClaim("name"),
        email: getClaim(
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ),
        preferred_username: getClaim("preferred_username"),
      },
    };
  },
});
