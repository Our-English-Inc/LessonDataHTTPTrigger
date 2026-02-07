const { app } = require("@azure/functions");
const { BlobServiceClient } = require("@azure/storage-blob");

app.http("restoreSafeCSV", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const { target } = await request.json();
      // target: "GameData" | "AdminData"

      if (!["GameData", "AdminData"].includes(target)) {
        return { status: 400, body: "Invalid restore target" };
      }

      const blobServiceClient =
        BlobServiceClient.fromConnectionString(
          process.env.LESSONDATA_STORAGE_CONNECTION_STRING
        );

      const container =
        blobServiceClient.getContainerClient("lessondata");

      const sourceBlob =
        container.getBlockBlobClient(`safe/${target}.csv`);

      const destBlob =
        container.getBlockBlobClient(`current/${target}.csv`);

      const download = await sourceBlob.download();
      const buffer = await streamToBuffer(download.readableStreamBody);

      await destBlob.uploadData(buffer, {
        overwrite: true,
        blobHTTPHeaders: {
          blobContentType: "text/csv; charset=utf-8"
        }
      });

      return {
        status: 200,
        jsonBody: { ok: true, restored: target }
      };
    } catch (err) {
      context.log(err);
      return { status: 500, body: String(err) };
    }
  }
});

// helper
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", d => chunks.push(d));
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
}
