const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

app.http("saveAdminsCSV", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const csv = await request.text();

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(
          process.env.LESSONDATA_STORAGE_CONNECTION_STRING
        );

      const containerClient =
        blobServiceClient.getContainerClient("lessondata");

      const blobClient =
        containerClient.getBlockBlobClient("current/AdminData.csv");

      await blobClient.uploadData(
        Buffer.from(csv),
        {
          overwrite: true,
          blobHTTPHeaders: {
            blobContentType: "text/csv; charset=utf-8"
          }
        }
      );

      return { status: 200, jsonBody: { ok: true } };
    } catch (err) {
      context.log(err);
      return { status: 500, body: String(err) };
    }
  }
});
