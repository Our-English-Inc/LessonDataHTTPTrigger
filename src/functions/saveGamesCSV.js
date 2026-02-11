const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

app.http("saveGamesCSV", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const { gameKey, csv } = await request.json();

      if (!gameKey || !csv) {
        return { status: 400, body: "Missing gameKey or csv" };
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(
          process.env.LESSONDATA_STORAGE_CONNECTION_STRING
        );

      const containerClient =
        blobServiceClient.getContainerClient("lessondata");

      await containerClient.createIfNotExists();

      const blobPath = `current/games/${gameKey}/config.csv`;

      const blobClient =
        containerClient.getBlockBlobClient(blobPath);

      await blobClient.uploadData(
        Buffer.from(csv),
        {
          blobHTTPHeaders: {
            blobContentType: "text/csv; charset=utf-8"
          },
          overwrite: true
        }
      );

      return {
        status: 200,
        jsonBody: { ok: true }
      };

    } catch (err) {
      context.log(err);
      return {
        status: 500,
        body: "Failed to write CSV"
      };
    }
  }
});
